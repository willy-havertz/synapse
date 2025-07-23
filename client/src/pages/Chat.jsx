// src/pages/Chat.jsx
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { socket } from "../services/socket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faSmile,
  faPaperclip,
  faPaperPlane,
  faPhone,
  faVideo,
  faEllipsisV,
  faSearch,
  faFilter,
  faTrash,
  faCopy,
  faChevronDown,
  faUsers,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ContactItem({ contact, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 mb-2 cursor-pointer transition ${
        active ? "bg-[#2a2a2a]" : "hover:bg-[#1f1f1f]"
      } rounded-xl`}
    >
      <img
        src={contact.avatarUrl}
        alt={contact.name}
        className="w-10 h-10 rounded-full mr-3 object-cover"
      />
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-semibold text-white truncate">
          {contact.name}
        </p>
        <p className="text-xs text-gray-400 truncate">{contact.status}</p>
      </div>
      {contact.online && !contact.isGroup && (
        <span className="w-3 h-3 bg-green-400 rounded-full ml-2" />
      )}
      {contact.unread > 0 && (
        <span className="ml-auto text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
          {contact.unread}
        </span>
      )}
    </div>
  );
}

function MessageBubble({ text, fromMe, timestamp, onDelete }) {
  const variants = {
    hidden: { opacity: 0, x: fromMe ? 50 : -50 },
    visible: { opacity: 1, x: 0 },
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.3 }}
      className={`group flex my-4 ${fromMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[70%] px-4 py-2 text-sm shadow-md break-words whitespace-pre-wrap ${
          fromMe
            ? "bg-purple-600 text-white rounded-2xl rounded-br-none"
            : "bg-[#1f1f1f] text-white rounded-2xl rounded-bl-none"
        }`}
      >
        <button
          onClick={() => {
            onDelete();
            toast.info("Message deleted");
          }}
          className="absolute top-1 right-1 p-1 bg-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition"
        >
          <FontAwesomeIcon
            icon={faTrash}
            className="text-gray-300 hover:text-white"
            size="sm"
          />
        </button>
        <button
          onClick={copyToClipboard}
          className="absolute top-1 right-8 p-1 bg-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition"
        >
          <FontAwesomeIcon
            icon={faCopy}
            className="text-gray-300 hover:text-white"
            size="sm"
          />
        </button>
        {text}
        <span className="absolute text-xs text-gray-500 -bottom-5 right-2">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </motion.div>
  );
}

export default function Chat() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Inline form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [joinName, setJoinName] = useState("");

  const endRef = useRef();
  const fileInputRef = useRef();
  const msgContainerRef = useRef();
  const typingTimeout = useRef();

  // Hide scrollbar in WebKit
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `.msg-container::-webkit-scrollbar { display: none; }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Load contacts
  useEffect(() => {
    if (!user) return;
    fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/chat/conversations/${user.id}`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((data) => {
        setContacts(data);
        if (data.length) setActiveContact(data[0]);
      })
      .catch(() => toast.error("Failed to load contacts"));
  }, [user]);

  // Fetch messages & join room
  useEffect(() => {
    if (!activeContact) return;
    fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/chat/messages/${
        activeContact._id
      }`,
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((msgs) => setMessages(msgs))
      .catch(() => toast.error("Failed to load messages"));

    socket.emit("join", {
      room: activeContact._id,
      userId: user.id,
    });

    return () => {
      socket.emit("leave", {
        room: activeContact._id,
        userId: user.id,
      });
      setMessages([]);
    };
  }, [activeContact, user]);

  // Socket listeners
  useEffect(() => {
    socket.on("message", (msg) => {
      if (msg.conversation === activeContact?._id) {
        setMessages((ms) => [...ms, msg]);
      }
    });
    socket.on("typing", ({ conversation, userId, isTyping }) => {
      if (conversation === activeContact?._id && userId !== user.id) {
        setTyping(isTyping);
        if (isTyping) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(false), 3000);
      }
    });
    return () => {
      socket.off("message");
      socket.off("typing");
    };
  }, [activeContact, user]);

  // Scroll logic
  const scrollToBottom = () =>
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    scrollToBottom();
    const el = msgContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 20;
      setShowScrollBtn(!atBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [messages]);

  // Select contact
  const selectContact = (c) => {
    setActiveContact(c);
    setContacts((cs) =>
      cs.map((x) => (x._id === c._id ? { ...x, unread: 0 } : x))
    );
    setMobileOpen(false);
  };

  // Send message
  const sendMessage = useCallback(() => {
    const txt = input.trim();
    if (!txt || !activeContact) return;
    const msg = {
      conversation: activeContact._id,
      sender: user.id,
      text: txt,
      createdAt: Date.now(),
    };
    socket.emit("message", msg);
    setMessages((ms) => [...ms, msg]);
    setInput("");
  }, [input, activeContact, user]);

  // Typing emit
  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!activeContact) return;
    socket.emit("typing", {
      room: activeContact._id,
      userId: user.id,
      isTyping: true,
    });
  };

  // Delete message
  const deleteMessage = (i) =>
    setMessages((ms) => ms.filter((_, idx) => idx !== i));

  // Submit create group
  const submitCreate = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return toast.error("Name required");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/chat/group`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: groupName, memberIds: [user.id] }),
        }
      );
      const group = await res.json();
      setContacts((cs) => [group, ...cs]);
      toast.success(`Group "${group.name}" created`);
      setGroupName("");
      setShowCreateForm(false);
    } catch {
      toast.error("Create group failed");
    }
  };

  // Submit join group (placeholder now “Group Name”)
  const submitJoin = async (e) => {
    e.preventDefault();
    if (!joinName.trim()) return toast.error("Group Name required");
    try {
      // Here we assume your backend can join by group name
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/chat/group/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ groupName: joinName, userId: user.id }),
        }
      );
      if (!res.ok) throw new Error();
      const group = await res.json();
      setContacts((cs) =>
        cs.some((c) => c._id === group._id) ? cs : [group, ...cs]
      );
      toast.success(`Joined "${group.name}"`);
      setJoinName("");
      setShowJoinForm(false);
    } catch {
      toast.error("Join group failed");
    }
  };

  const filtered = contacts
    .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((c) => (onlineOnly && !c.isGroup ? c.online : true));

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />

      <div className="flex h-screen overflow-hidden bg-[#101010] text-white">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-2/3 sm:w-1/2 md:static md:w-2/5
            transform transition-transform duration-200 bg-[#1f1f1f] border-r border-[#2a2a2a]
            ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
            <h2 className="text-lg font-semibold">Contacts</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setShowJoinForm(false);
                }}
                title="Create Group"
                className="p-1 rounded hover:bg-[#2a2a2a]"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <button
                onClick={() => {
                  setShowJoinForm(!showJoinForm);
                  setShowCreateForm(false);
                }}
                title="Join Group"
                className="p-1 rounded hover:bg-[#2a2a2a]"
              >
                <FontAwesomeIcon icon={faUsers} />
              </button>
              <button
                onClick={() => setOnlineOnly((o) => !o)}
                className={`p-1 rounded ${
                  onlineOnly ? "bg-purple-600" : "hover:bg-[#2a2a2a]"
                }`}
                title="Online Only"
              >
                <FontAwesomeIcon icon={faFilter} />
              </button>
              <button
                className="md:hidden p-1"
                onClick={() => setMobileOpen(false)}
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>
          </div>

          {/* Create Group Form */}
          {showCreateForm && (
            <form
              onSubmit={submitCreate}
              className="p-4 space-y-2 border-b border-[#2a2a2a]"
            >
              <input
                type="text"
                placeholder="Group name"
                className="w-full px-3 py-2 bg-[#2a2a2a] rounded text-white outline-none"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-600 rounded"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-purple-600 rounded"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          {/* Join Group Form */}
          {showJoinForm && (
            <form
              onSubmit={submitJoin}
              className="p-4 space-y-2 border-b border-[#2a2a2a]"
            >
              <input
                type="text"
                placeholder="Group Name"
                className="w-full px-3 py-2 bg-[#2a2a2a] rounded text-white outline-none"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-600 rounded"
                  onClick={() => setShowJoinForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-purple-600 rounded"
                >
                  Join
                </button>
              </div>
            </form>
          )}

          {/* Search */}
          <div className="flex items-center p-3 mx-4 my-3 bg-[#2a2a2a] rounded-full">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full bg-transparent outline-none text-white placeholder-gray-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto px-2">
            {filtered.length ? (
              filtered.map((c) => (
                <ContactItem
                  key={c._id}
                  contact={c}
                  active={c._id === activeContact?._id}
                  onClick={() => selectContact(c)}
                />
              ))
            ) : (
              <p className="text-center text-gray-500 mt-4">
                No contacts found
              </p>
            )}
          </div>
        </aside>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col md:ml-6">
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 bg-[#1f1f1f] border-b border-[#2a2a2a]">
            <div className="flex items-center space-x-3">
              <button
                className="md:hidden p-1"
                onClick={() => setMobileOpen(true)}
              >
                <FontAwesomeIcon icon={faBars} size="lg" />
              </button>
              {activeContact && (
                <>
                  <img
                    src={activeContact.avatarUrl}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{activeContact.name}</p>
                    <p
                      className={`text-sm ${
                        activeContact.online
                          ? "text-green-400"
                          : "text-gray-500"
                      }`}
                    >
                      {activeContact.isGroup
                        ? "Group chat"
                        : activeContact.online
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-4 text-gray-400">
              <FontAwesomeIcon
                icon={faPhone}
                title="Voice call"
                className="hover:text-white cursor-pointer"
                onClick={() =>
                  activeContact && navigate(`/call/${activeContact._id}`)
                }
              />
              <FontAwesomeIcon
                icon={faVideo}
                title="Video call"
                className="hover:text-white cursor-pointer"
                onClick={() =>
                  activeContact && navigate(`/video/${activeContact._id}`)
                }
              />
              <FontAwesomeIcon
                icon={faTrash}
                title="Clear Chat"
                className="hover:text-white cursor-pointer"
                onClick={() => {
                  setMessages([]);
                  toast.info("Chat cleared");
                }}
              />
              <FontAwesomeIcon
                icon={faEllipsisV}
                title="More"
                className="hover:text-white cursor-pointer"
              />
            </div>
          </header>

          {/* Messages */}
          <div className="relative flex-1">
            <main
              ref={msgContainerRef}
              className="msg-container flex-1 p-4 overflow-y-auto bg-[#101010]"
              style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            >
              <AnimatePresence initial={false}>
                {messages.length ? (
                  messages.map((m, i) => (
                    <MessageBubble
                      key={i}
                      text={m.text}
                      fromMe={m.sender === user.id}
                      timestamp={m.createdAt || m.timestamp}
                      onDelete={() => deleteMessage(i)}
                    />
                  ))
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-500 mt-8"
                  >
                    No messages yet. Send one below!
                  </motion.p>
                )}
              </AnimatePresence>
              {typing && (
                <p className="text-sm text-gray-400 italic mb-2">Typing...</p>
              )}
              <div ref={endRef} />
            </main>
            {showScrollBtn && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 bg-purple-600 p-2 rounded-full shadow-lg hover:bg-purple-500"
                title="Scroll to bottom"
              >
                <FontAwesomeIcon icon={faChevronDown} className="text-white" />
              </button>
            )}
          </div>

          {/* Input */}
          <footer className="flex items-center px-4 py-3 bg-[#1f1f1f] border-t border-[#2a2a2a]">
            <button
              onClick={() => alert("Emoji picker…")}
              title="Emoji"
              className="text-gray-500 hover:text-white mr-3"
            >
              <FontAwesomeIcon icon={faSmile} size="lg" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
              className="text-gray-500 hover:text-white mr-3"
            >
              <FontAwesomeIcon icon={faPaperclip} size="lg" />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] &&
                  toast.info(`File: ${e.target.files[0].name}`)
                }
              />
            </button>
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 text-sm bg-[#2a2a2a] rounded-full placeholder-gray-500 outline-none"
              value={input}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`ml-3 p-3 rounded-full transition ${
                input.trim()
                  ? "bg-purple-600 hover:bg-purple-500"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
              title="Send"
            >
              <FontAwesomeIcon icon={faPaperPlane} size="lg" />
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}
