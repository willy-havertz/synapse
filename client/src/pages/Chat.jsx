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

  // Load conversations
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

  // Load messages on active change
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

  // Socket handlers
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
        setMessages((ms) => [...ms, fileData]);
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

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Attach media streams
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

  // UI actions
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

  // Call handlers
  const handleVoiceCall = async () => {
    if (!active) return;
    const stream = await startCall(active.id, "voice", (s) =>
      setRemoteStream(s)
    );
    setLocalStream(stream);
  };

  const handleVideoCall = async () => {
    if (!active) return;
    const stream = await startCall(active.id, "video", (s) =>
      setRemoteStream(s)
    );
    setLocalStream(stream);
  };

  const handleAccept = async () => {
    if (!active) return;
    const stream = await answerCall(active.id, (s) => setRemoteStream(s));
    setLocalStream(stream);
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
      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <ToastContainer
          position="top-right"
          autoClose={2000}
          theme={dark ? "dark" : "light"}
        />

        <div className="relative z-10">
          <ChatHeader
            active={active}
            onToggleSidebar={toggleSidebar}
            onVoiceCall={handleVoiceCall}
            onVideoCall={handleVideoCall}
            onAccept={handleAccept}
            onHangUp={handleHangUp}
            onMore={() => setShowMoreMenu((v) => !v)}
            inCall={inCall}
            incomingCall={incomingCall}
          />
          {showMoreMenu && (
            <div className="absolute right-4 mt-2">
              <MoreMenu onClose={() => setShowMoreMenu(false)} />
            </div>
          )}
        </div>

        <main
          ref={containerRef}
          className={`flex-1 p-4 overflow-y-auto ${
            dark ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          {messages.map((m, i) =>
            m.url ? (
              m.file.type.startsWith("image/") ? (
                <img
                  key={i}
                  src={m.url}
                  alt="attachment"
                  className="max-w-xs rounded mb-2"
                />
              ) : (
                <a
                  key={i}
                  href={m.url}
                  className={`block mb-2 hover:underline ${
                    dark ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Download {m.file.name}
                </a>
              )
            ) : (
              <MessageBubble
                key={m._id || i}
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

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-20 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
          md:relative md:translate-x-0 md:inset-y-0 md:left-0 md:right-auto
          w-64 border-l ${
            dark ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"
          }`}
      >
        <SidebarHeader />
        <div className="mt-4 flex-1 overflow-y-auto">
          <button
            className={`w-full px-4 py-2 text-left hover:${
              dark ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            Join Group
          </button>
          <button
            className={`w-full px-4 py-2 text-left hover:${
              dark ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            Create Group
          </button>
          <button
            className={`w-full px-4 py-2 text-left hover:${
              dark ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            Name Chats
          </button>
          <hr
            className={`my-2 ${dark ? "border-gray-700" : "border-gray-300"}`}
          />
          {contacts.length ? (
            contacts.map((c) => (
              <ContactItem
                key={c._id}
                contact={c}
                active={c._id === active?._id}
                onClick={() => selectContact(c)}
              />
            ))
          ) : (
            <p className={`p-4 ${dark ? "text-gray-400" : "text-gray-500"}`}>
              No chats
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
