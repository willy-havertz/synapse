import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import ThemeContext from "../contexts/ThemeContext";
import api from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserEdit, faImage, faSave } from "@fortawesome/free-solid-svg-icons";

export default function Settings() {
  const { user } = useContext(AuthContext);
  const { dark } = useContext(ThemeContext);

  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const fileInputRef = useRef();

  // Initialize form with user data
  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setAvatarPreview(user.avatarUrl || null);
  }, [user]);

  // Track whether changes have been made
  useEffect(() => {
    if (!user) return setDirty(false);
    setDirty(name.trim() !== (user.name || "") || Boolean(avatarFile));
  }, [name, avatarFile, user]);

  // Generate avatar preview on file select
  useEffect(() => {
    if (!avatarFile) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(avatarFile);
  }, [avatarFile]);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (avatarFile) formData.append("avatar", avatarFile);
      await api.put("/auth/profile", formData);
      showToast("Profile updated successfully!");
      setDirty(false);
    } catch {
      showToast("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <div className="p-6 text-center">Loading account…</div>;
  }

  return (
    <div
      className={`${
        dark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      } min-h-screen p-6 space-y-8`}
    >
      {/* Toast */}
      {toast.visible && (
        <div className="fixed top-5 right-5 rounded-md bg-gray-800 px-4 py-2 text-white shadow-lg">
          {toast.message}
        </div>
      )}

      <h1 className="text-3xl font-bold">Account Settings</h1>

      <form
        onSubmit={handleSave}
        className={`${
          dark ? "bg-gray-800" : "bg-gray-100"
        } space-y-6 rounded-lg p-6`}
      >
        {/* Name & Email */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Name */}
          <div>
            <label className="block mb-2 text-sm font-medium">Name</label>
            <div
              className={`${
                dark ? "bg-gray-700" : "bg-white"
              } flex items-center rounded-lg px-3 py-2`}
            >
              <FontAwesomeIcon
                icon={faUserEdit}
                className="mr-3 text-purple-400"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>
          {/* Email (read-only) */}
          <div>
            <label className="block mb-2 text-sm font-medium">Email</label>
            <div
              className={`${
                dark ? "bg-gray-700 opacity-70" : "bg-gray-200"
              } flex items-center rounded-lg px-3 py-2`}
            >
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full bg-transparent cursor-not-allowed text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="block mb-2 text-sm font-medium">Avatar</label>
          <div className="flex items-center space-x-6">
            <div
              className={`w-24 h-24 overflow-hidden rounded-full ${
                dark ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faImage}
                  className="m-auto text-gray-500"
                  size="2x"
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className={`${
                dark
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              } flex items-center space-x-2 rounded-full px-4 py-2 transition`}
            >
              <FontAwesomeIcon icon={faImage} />
              <span>Choose Avatar</span>
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
          className={`mx-auto flex items-center space-x-2 rounded-md px-6 py-3 text-white transition ${
            dirty && !saving
              ? "bg-purple-500 hover:bg-purple-600"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          <FontAwesomeIcon icon={faSave} />
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
      </form>

      {/* Privacy & Terms */}
      <div className="flex justify-between px-2 text-sm">
        <Link to="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link to="/terms" className="hover:underline">
          Terms of Service
        </Link>
      </div>

      {/* Sign Out */}
      <button
        onClick={() => setShowModal(true)}
        className={`${
          dark
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-gray-200 hover:bg-gray-300"
        } w-full max-w-xs rounded-md px-6 py-3 transition`}
      >
        Sign Out
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`${
              dark ? "bg-gray-800" : "bg-white"
            } max-w-sm space-y-4 rounded-lg p-6`}
          >
            <h2 className="text-xl font-semibold">Confirm Sign Out</h2>
            <p className="text-gray-400">Are you sure you want to sign out?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md px-4 py-2 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  delete api.defaults.headers.common.Authorization;
                  window.location.replace("/");
                }}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
