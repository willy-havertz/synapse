import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const { user, signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate("/home", { replace: true });
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA");
      return;
    }

    setSubmitting(true);
    try {
      await signup(form.name, form.email, form.password, recaptchaToken);
      toast.success("🎉 Registration successful! Redirecting…");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || "❌ Registration failed");
      recaptchaRef.current.reset();
      setRecaptchaToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Vite env var for site key
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
        <h2 className="flex items-center justify-center text-4xl font-extrabold text-white">
          <FontAwesomeIcon icon={faUserPlus} className="mr-2 text-purple-400" />
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center text-gray-300 mb-1">
              <FontAwesomeIcon icon={faUser} className="mr-2" /> Name
            </label>
            <input
              name="name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="flex items-center text-gray-300 mb-1">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" /> Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="flex items-center text-gray-300 mb-1">
              <FontAwesomeIcon icon={faLock} className="mr-2" /> Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={siteKey}
              onChange={setRecaptchaToken}
              ref={recaptchaRef}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full flex items-center justify-center py-2 font-semibold rounded-lg transition
              ${
                submitting
                  ? "bg-gray-600 cursor-not-allowed text-gray-300"
                  : "bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 text-white"
              }`}
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            {submitting ? "Signing Up…" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-purple-400 hover:underline focus:outline-none"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}
