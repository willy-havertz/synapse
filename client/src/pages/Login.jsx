// src/pages/Login.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faSignInAlt,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import ReCAPTCHA from "react-google-recaptcha";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const strengthLabels = ["Too Short", "Weak", "Fair", "Strong", "Very Strong"];
function calcPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export default function Login() {
  const { user, login, signup, sendResetEmail } = useContext(AuthContext);
  const navigate = useNavigate();
  const formTop = useRef();
  const recaptchaRef = useRef();

  const [mode, setMode] = useState("login"); // "login" | "signup" | "reset"
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  useEffect(() => {
    if (user) navigate("/home", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    formTop.current?.scrollIntoView({ behavior: "smooth" });
    setErrors({});
    // reset recaptcha when mode changes
    setRecaptchaToken(null);
    recaptchaRef.current?.reset();
  }, [mode]);

  const validate = () => {
    const errs = {};
    if (mode === "signup" && !form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (mode !== "reset") {
      if (!form.password) errs.password = "Password is required";
      else if (mode === "signup" && form.password.length < 8)
        errs.password = "At least 8 characters";
    }
    if (!recaptchaToken) {
      errs.recaptcha = "Please complete the reCAPTCHA";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (mode === "login") {
        await login(form.email, form.password, form.remember, recaptchaToken);
        toast.success("Logged in successfully!", { icon: "✔️" });
      } else if (mode === "signup") {
        await signup(form.name, form.email, form.password, recaptchaToken);
        toast.success("Registration successful! Please log in.", {
          icon: "🎉",
        });
        setMode("login");
      } else {
        await sendResetEmail(form.email, recaptchaToken);
        toast.info("If that email exists, reset instructions have been sent.");
        setMode("login");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      // reset recaptcha for next submit
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  const pwStrength = calcPasswordStrength(form.password);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#101010] px-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        transition={Slide}
        theme="dark"
        toastClassName="bg-[#2a2a2a] text-white border-purple-500 border rounded-lg"
        bodyClassName="text-sm"
        progressClassName="bg-purple-400"
      />

      <div
        ref={formTop}
        className="w-full max-w-lg bg-[#1f1f1f] rounded-xl shadow-xl p-8 space-y-6 transition-all duration-500 overflow-hidden"
      >
        <h2 className="flex items-center justify-center text-4xl font-extrabold text-white">
          <FontAwesomeIcon
            icon={
              mode === "login"
                ? faSignInAlt
                : mode === "signup"
                ? faUser
                : faLock
            }
            className="mr-2 text-purple-400"
          />
          {mode === "login"
            ? "Sign In"
            : mode === "signup"
            ? "Sign Up"
            : "Reset Password"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-4 py-2 bg-[#2a2a2a] text-white rounded-lg outline-none ${
                  errors.name
                    ? "border-red-500 border"
                    : "focus:ring-2 focus:ring-purple-500"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-4 py-2 bg-[#2a2a2a] text-white rounded-lg outline-none ${
                errors.email
                  ? "border-red-500 border"
                  : "focus:ring-2 focus:ring-purple-500"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {mode !== "reset" && (
            <div>
              <label className="block text-gray-300 mb-1">Password</label>
              <div
                className={`flex items-center bg-[#2a2a2a] rounded-lg px-3 py-2 ${
                  errors.password
                    ? "border-red-500 border"
                    : "focus-within:ring-2 focus-within:ring-purple-500"
                }`}
              >
                <FontAwesomeIcon
                  icon={faLock}
                  className="text-purple-400 mr-3"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  onFocus={() => setPwFocused(true)}
                  onBlur={() => setPwFocused(false)}
                  className="flex-1 bg-transparent text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-gray-400 hover:text-gray-200 ml-2 focus:outline-none"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-red-500 text-sm">{errors.password}</p>
              )}
              <div className="mt-2">
                <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full ${
                      pwStrength < 2
                        ? "bg-red-500"
                        : pwStrength < 4
                        ? "bg-yellow-400"
                        : "bg-green-400"
                    }`}
                    style={{ width: `${(pwStrength / 4) * 100}%` }}
                  />
                </div>
                <p className="text-gray-400 text-sm">
                  Strength: {strengthLabels[pwStrength]}
                </p>
                {pwFocused && (
                  <ul className="mt-1 text-xs text-gray-500 list-disc list-inside space-y-0.5">
                    <li>8+ characters</li>
                    <li>One uppercase letter</li>
                    <li>One number</li>
                    <li>One symbol</li>
                  </ul>
                )}
              </div>
            </div>
          )}

          <div>
            <ReCAPTCHA
              sitekey="YOUR_RECAPTCHA_SITE_KEY"
              onChange={(token) => {
                setRecaptchaToken(token);
                setErrors((e) => ({ ...e, recaptcha: undefined }));
              }}
              ref={recaptchaRef}
            />
            {errors.recaptcha && (
              <p className="mt-1 text-red-500 text-sm">{errors.recaptcha}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center py-2 text-white font-semibold rounded-lg transition ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300"
            }`}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : (
              <FontAwesomeIcon
                icon={mode === "login" ? faSignInAlt : faUser}
                className="mr-2"
              />
            )}
            {
              {
                login: loading ? "Logging In..." : "Log In",
                signup: loading ? "Signing Up..." : "Sign Up",
                reset: loading ? "Sending..." : "Send Reset Link",
              }[mode]
            }
          </button>
        </form>

        <div className="text-center space-y-2 text-sm text-gray-400">
          {mode !== "reset" && (
            <p>
              {mode === "login"
                ? "Don't have an account?"
                : "Already have one?"}{" "}
              <button
                onClick={() =>
                  setMode((m) =>
                    m === "login"
                      ? "signup"
                      : m === "signup"
                      ? "login"
                      : "login"
                  )
                }
                className="text-purple-400 hover:underline focus:outline-none"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          )}
          {mode === "login" && (
            <p>
              Forgot your password?{" "}
              <button
                onClick={() => setMode("reset")}
                className="text-purple-400 hover:underline focus:outline-none"
              >
                Reset here
              </button>
            </p>
          )}
        </div>

        {mode === "reset" && (
          <p className="text-center text-xs text-gray-500">
            <Link to="/login" className="text-purple-400 hover:underline">
              Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
