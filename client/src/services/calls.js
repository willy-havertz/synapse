// src/services/calls.js
import { socket } from "./socket";

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const peerConnections = {};
let localStream = null;

function getOrCreatePC(peerId, onTrack) {
  if (peerConnections[peerId]) return peerConnections[peerId];

  const pc = new RTCPeerConnection(rtcConfig);

  pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
      socket.emit("call:candidate", { to: peerId, from: socket.id, candidate });
    }
  };

  pc.ontrack = (event) => {
    const [remoteStream] = event.streams;
    onTrack(remoteStream);
  };

  peerConnections[peerId] = pc;
  return pc;
}

export async function initLocalStream(
  constraints = { audio: true, video: true }
) {
  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
  }
  return localStream;
}

export async function startCall(peerId, type = "video", onRemoteStream) {
  const constraints =
    type === "voice"
      ? { audio: true, video: false }
      : { audio: true, video: true };

  const stream = await initLocalStream(constraints);
  const pc = getOrCreatePC(peerId, onRemoteStream);

  stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.emit("call:offer", {
    to: peerId,
    from: socket.id,
    offer,
  });

  return stream;
}

export async function answerCall(peerId, onRemoteStream) {
  const pc = getOrCreatePC(peerId, onRemoteStream);
  const stream = await initLocalStream({ audio: true, video: true });

  stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  socket.on("call:offer", async ({ from, offer }) => {
    if (from !== peerId) return;
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("call:answer", {
      to: peerId,
      from: socket.id,
      answer,
    });
  });

  return stream;
}

export function setupSignaling({ onIncomingCall, onHangup }) {
  socket.on("call:offer", ({ from }) => {
    onIncomingCall(from);
  });

  socket.on("call:answer", async ({ from, answer }) => {
    const pc = peerConnections[from];
    if (pc) await pc.setRemoteDescription(answer);
  });

  socket.on("call:candidate", async ({ from, candidate }) => {
    const pc = peerConnections[from];
    if (pc && candidate) await pc.addIceCandidate(candidate);
  });


  socket.on("call:hangup", ({ from }) => {
    onHangup(from);
    if (peerConnections[from]) {
      peerConnections[from].close();
      delete peerConnections[from];
    }
  });
}

export function hangUp(peerId) {
  socket.emit("call:hangup", { to: peerId, from: socket.id });
  if (peerConnections[peerId]) {
    peerConnections[peerId].close();
    delete peerConnections[peerId];
  }
}
