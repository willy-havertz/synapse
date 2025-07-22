// src/pages/Settings.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import api from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserEdit, faImage, faSave } from "@fortawesome/free-solid-svg-icons";

export default function Settings() {
  const { user, logout } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const fileInputRef = useRef();

  // Populate fields once user arrives
  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setAvatarPreview(user.avatarUrl || null);
  }, [user]);

  // Mark dirty when name or avatar change
  useEffect(() => {
    if (!user) {
      setDirty(false);
      return;
    }
    setDirty(name.trim() !== (user.name || "") || Boolean(avatarFile));
  }, [name, avatarFile, user]);

  // Generate avatar preview
  useEffect(() => {
    if (!avatarFile) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(avatarFile);
  }, [avatarFile]);

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", name.trim());
      if (avatarFile) form.append("avatar", avatarFile);
      await api.put("/auth/profile", form);
      showToast("Profile updated successfully!");
      setDirty(false);
    } catch {
      showToast("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <div className="text-white p-6">Loading account…</div>;
  }

  return (
    <div className="relative space-y-8 max-w-3xl mx-auto p-6">
      {/* Toast */}
      {toast.visible && (
        <div className="fixed top-5 right-5 bg-gray-800 text-white px-4 py-2 rounded shadow-lg">
          {toast.message}
        </div>
      )}

      <h1 className="text-3xl font-bold text-white">Account Settings</h1>

      <form
        onSubmit={handleSave}
        className="bg-[#1f1f1f] p-6 rounded-lg space-y-6"
      >
        {/* Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-gray-300 mb-2">Name</label>
            <div className="flex items-center bg-[#2a2a2a] rounded-lg px-3 py-2">
              <FontAwesomeIcon
                icon={faUserEdit}
                className="text-purple-400 mr-3"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-white outline-none placeholder-gray-500"
                placeholder="Your Name"
              />
            </div>
          </div>
          {/* Email (read‑only) */}
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <div className="flex items-center bg-[#2a2a2a] rounded-lg px-3 py-2 opacity-70">
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full bg-transparent text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="block text-gray-300 mb-2">Avatar</label>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-[#2a2a2a] rounded-full overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <FontAwesomeIcon icon={faImage} />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition"
            >
              <FontAwesomeIcon icon={faImage} className="mr-2" />
              Choose Avatar
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files[0] && setAvatarFile(e.target.files[0])
              }
            />
          </div>
        </div>

        {/* Save Changes */}
        <button
          type="submit"
          disabled={!dirty || saving}
          className={`flex items-center justify-center w-full max-w-xs mx-auto px-6 py-3 rounded-md text-white transition ${
            dirty && !saving
              ? "bg-purple-500 hover:bg-purple-600"
              : "bg-gray-700 cursor-not-allowed"
          }`}
        >
          <FontAwesomeIcon icon={faSave} />
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      </form>

      {/* Privacy & Terms Links */}
      <div className="flex justify-between text-gray-400 px-2">
        <Link to="/privacy" className="hover:text-white">
          Privacy Policy
        </Link>
        <Link to="/terms" className="hover:text-white">
          Terms of Service
        </Link>
      </div>

      {/* Sign Out */}
      <div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full max-w-xs bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-md transition"
        >
          Sign Out
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#1f1f1f] rounded-lg p-6 max-w-sm w-full space-y-4">
            <h2 className="text-xl text-white font-semibold">
              Confirm Sign Out
            </h2>
            <p className="text-gray-300">Are you sure you want to sign out?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  logout();
                }}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-white"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
