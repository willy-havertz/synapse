// src/pages/Chat.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import AuthContext from "../contexts/AuthContext";
import ThemeContext from "../contexts/ThemeContext";
import { socket } from "../services/socket";
import {
  startCall,
  answerCall,
  setupSignaling,
  hangUp,
} from "../services/calls";
import SidebarHeader from "../components/SidebarHeader";
import ContactItem from "../components/ContactItem";
import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";
import MoreMenu from "../components/MoreMenu";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export default function Chat() {
  const { user } = useContext(AuthContext);
  const { dark } = useContext(ThemeContext);

  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const containerRef = useRef();
  const endRef = useRef();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    if (!user) return;
    fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/chat/conversations/${user.id}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((data) => {
        setContacts(data);
        setActive(data[0] || null);
      })
      .catch(() => toast.error("Cannot load chats"));
  }, [user]);

  useEffect(() => {
    if (!active) return;
    fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/chat/messages/${active._id}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then(setMessages)
      .catch(() => toast.error("Cannot load messages"));

    socket.emit("join-chat", { userId: socket.id });
    return () => {
      socket.emit("leave-chat", { userId: socket.id });
      setMessages([]);
    };
  }, [active]);

  useEffect(() => {
    setupSignaling({
      onIncomingCall: (from) => {
        if (from === active?.id) setIncomingCall(true);
      },
      onRemoteStream: (_, stream) => {
        setRemoteStream(stream);
        setInCall(true);
      },
      onHangup: cleanupCall,
    });

    const onMessage = (msg) =>
      active &&
      msg.conversation === active._id &&
      setMessages((ms) => [...ms, msg]);
    const onFile = ({ conversation, fileData }) => {
      if (conversation === active._id) {
        setMessages((ms) => [...ms, { ...fileData, conversation }]);
      }
    };
    const onTyping = ({ conversation, isTyping }) =>
      conversation === active?._id && setTyping(isTyping);

    socket.on("message", onMessage);
    socket.on("file", onFile);
    socket.on("typing", onTyping);

    return () => {
      socket.off("message", onMessage);
      socket.off("file", onFile);
      socket.off("typing", onTyping);
    };
  }, [active]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const cleanupCall = () => {
    setInCall(false);
    setIncomingCall(false);
    setLocalStream(null);
    setRemoteStream(null);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const selectContact = useCallback((c) => {
    setActive(c);
    setContacts((list) =>
      list.map((x) => (x._id === c._id ? { ...x, unread: 0 } : x))
    );
    setSidebarOpen(false);
  }, []);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || !active) return;
      const msg = {
        conversation: active._id,
        sender: user.id,
        text,
        createdAt: Date.now(),
      };
      socket.emit("message", msg);
      setMessages((ms) => [...ms, msg]);
    },
    [active, user]
  );

  const sendFile = useCallback(
    (file, url) => {
      if (!active) return;
      const fileData = {
        conversation: active._id,
        sender: user.id,
        file,
        url,
        createdAt: Date.now(),
      };
      socket.emit("file", fileData);
      setMessages((ms) => [...ms, fileData]);
    },
    [active, user]
  );

  const handleVoiceCall = async () => {
    if (!active) return;
    const stream = await startCall(active.id, "voice", (stream) =>
      setRemoteStream(stream)
    );
    setLocalStream(stream);
  };

  const handleVideoCall = async () => {
    if (!active) return;
    const stream = await startCall(active.id, "video", (stream) =>
      setRemoteStream(stream)
    );
    setLocalStream(stream);
  };

  const handleAccept = async () => {
    if (!active) return;
    const stream = await answerCall(active.id, (stream) =>
      setRemoteStream(stream)
    );
    setLocalStream(stream);
    setIncomingCall(false);
  };

  const handleReject = () => {
    setIncomingCall(false);
  };

  const handleHangUp = () => {
    if (!active) return;
    hangUp(active.id);
    cleanupCall();
  };

  return (
    <div
      className={`flex h-screen relative overflow-hidden ${
        dark ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      {!sidebarOpen && (
        <button
          className={`md:hidden absolute top-4 left-4 z-20 p-2 ${
            dark ? "bg-gray-800" : "bg-gray-200"
          } rounded-full`}
          onClick={toggleSidebar}
        >
          <FontAwesomeIcon
            icon={faBars}
            className={dark ? "text-white" : "text-black"}
          />
        </button>
      )}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 w-64 z-20 transform
        md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
        ${dark ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"}
        border-r`}
      >
        <SidebarHeader />
        <div className="flex-1 overflow-y-auto mt-4">
          <button
            className={`w-full text-left px-4 py-2 hover:${
              dark ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            Join Group
          </button>
          <button
            className={`w-full text-left px-4 py-2 hover:${
              dark ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            Create Group
          </button>
          <button
            className={`w-full text-left px-4 py-2 hover:${
              dark ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            Name Chats
          </button>
          <hr
            className={dark ? "my-2 border-gray-700" : "my-2 border-gray-300"}
          />
          {contacts.length > 0 ? (
            contacts.map((c) => (
              <ContactItem
                key={c._id}
                contact={c}
                active={c._id === active?._id}
                onClick={() => selectContact(c)}
              />
            ))
          ) : (
            <p className={dark ? "p-4 text-gray-400" : "p-4 text-gray-500"}>
              No chats
            </p>
          )}
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <ToastContainer
          position="top-right"
          autoClose={2000}
          theme={dark ? "dark" : "light"}
        />
        <ChatHeader
          active={active}
          onToggleSidebar={toggleSidebar}
          onVoiceCall={handleVoiceCall}
          onVideoCall={handleVideoCall}
          onAccept={handleAccept}
          onReject={handleReject}
          onHangUp={handleHangUp}
          onMore={() => setShowMoreMenu((v) => !v)}
          inCall={inCall}
          incomingCall={incomingCall}
        />
        {showMoreMenu && <MoreMenu onClose={() => setShowMoreMenu(false)} />}
        <main
          ref={containerRef}
          className={`flex-1 p-4 overflow-y-auto scroll-smooth ${
            dark ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          {messages.map((m, idx) =>
            m.url ? (
              m.file.type.startsWith("image/") ? (
                <img
                  key={idx}
                  src={m.url}
                  alt="attachment"
                  className="max-w-xs rounded mb-2"
                />
              ) : (
                <a
                  key={idx}
                  href={m.url}
                  className={`mb-2 block hover:underline ${
                    dark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Download {m.file.name}
                </a>
              )
            ) : (
              <MessageBubble
                key={m._id || idx}
                msg={m}
                isMe={m.sender === user.id}
              />
            )
          )}
          {typing && (
            <p
              className={`italic mb-2 ${
                dark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Typing...
            </p>
          )}
          <div ref={endRef} />
        </main>
        <ChatInput
          onSend={sendMessage}
          onFileSend={sendFile}
          activeId={active?._id}
        />
        {localStream && (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="absolute bottom-4 right-4 w-32 h-24 bg-black rounded-md"
          />
        )}
        {remoteStream && (
          <video
            ref={remoteVideoRef}
            autoPlay
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
