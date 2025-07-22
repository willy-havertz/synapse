// src/pages/Landing.jsx
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import ThemeContext from "../contexts/ThemeContext";
import ThemeToggle from "../contexts/ThemeToggle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faComments,
  faCamera,
  faCloudSun,
  faMobileAlt,
  faRocket,
  faChartBar,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const FEATURES = [
  {
    icon: faComments,
    title: "Real‑time Chat",
    desc: "Connect instantly with friends.",
  },
  {
    icon: faCamera,
    title: "Photo Analyzer",
    desc: "AI‑powered image insights.",
  },
  {
    icon: faCloudSun,
    title: "Weather Dashboard",
    desc: "Accurate local forecasts.",
  },
  {
    icon: faMobileAlt,
    title: "Device Inspector",
    desc: "Monitor your device health.",
  },
  { icon: faRocket, title: "Tech Trends", desc: "Stay ahead of the curve." },
  { icon: faChartBar, title: "Analytics", desc: "Deep engagement insights." },
];

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export default function Landing() {
  const { dark } = useContext(ThemeContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [langOpen, setLangOpen] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div
      className={`${
        dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      } min-h-screen flex flex-col`}
    >
      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between p-6 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-extrabold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Synapse
          </span>
        </h1>

        {/* Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => scrollTo("features")}
            className="hover:text-purple-500 transition"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo("faq")}
            className="hover:text-purple-500 transition"
          >
            FAQ
          </button>
          <Link to="/about" className="hover:text-purple-500 transition">
            About
          </Link>

          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className={`
                flex items-center space-x-1 px-3 py-1 rounded-full border transition
                ${
                  dark
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-300 hover:border-gray-400"
                }
              `}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="text-sm">{lang.code.toUpperCase()}</span>
            </button>
            {langOpen && (
              <ul
                className={`
                absolute right-0 mt-2 w-32 rounded-lg overflow-hidden shadow-lg
                ${dark ? "bg-gray-800" : "bg-white"}
              `}
              >
                {LANGUAGES.map((l) => (
                  <li key={l.code}>
                    <button
                      onClick={() => {
                        setLang(l);
                        setLangOpen(false);
                      }}
                      className="w-full px-4 py-2 flex items-center space-x-2 hover:bg-purple-100 hover:text-gray-900 transition"
                    >
                      <span className="text-xl">{l.flag}</span>
                      <span className="text-sm">{l.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            to="/login"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-full transition"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 border border-purple-500 hover:bg-purple-500 rounded-full transition"
          >
            Sign Up
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-700 transition"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} size="lg" />
        </button>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className={`${
              dark ? "bg-gray-800" : "bg-white"
            } absolute top-full inset-x-0 shadow-lg flex flex-col items-center space-y-4 py-6 md:hidden`}
          >
            <button
              onClick={() => scrollTo("features")}
              className="hover:text-purple-500 text-lg"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="hover:text-purple-500 text-lg"
            >
              FAQ
            </button>
            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="hover:text-purple-500 text-lg"
            >
              About
            </Link>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full transition"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="px-6 py-2 border border-purple-500 hover:bg-purple-500 rounded-full transition"
            >
              Sign Up
            </Link>
            <ThemeToggle />
          </div>
        )}
      </nav>

      {/* Hero */}
      <header className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Floating bubbles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`bg-purple-500 opacity-20 rounded-full animate-float`}
              style={{
                width: 80 + i * 15,
                height: 80 + i * 15,
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 80}%`,
                animationDuration: `${15 + i * 4}s`,
                animationDelay: `${i * 1.5}s`,
              }}
            />
          ))}
        </div>

        <h2 className="text-5xl sm:text-6xl font-extrabold mb-4 z-10">
          Welcome to <span className="text-purple-500">Synapse</span>
        </h2>
        <p className="text-lg sm:text-xl max-w-2xl mb-8 z-10">
          Your all‑in‑one AI toolkit: chat, photo analysis, weather, device
          insights, tech trends, analytics—and more.
        </p>
        <div className="space-x-4 z-10">
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:scale-105 rounded-full text-lg font-semibold shadow-lg transition"
          >
            <FontAwesomeIcon icon={faBolt} className="mr-2" />
            Get Started
          </Link>
          <button
            onClick={() => scrollTo("features")}
            className="inline-flex items-center px-6 py-4 border border-gray-500 hover:border-purple-500 rounded-full text-gray-400 hover:text-gray-100 transform hover:scale-105 transition"
          >
            Discover Features
          </button>
        </div>
      </header>

      {/* Features */}
      <section
        id="features"
        className={`${dark ? "bg-gray-800" : "bg-gray-100"} py-16`}
      >
        <h3 className="text-3xl font-bold text-center mb-10">
          Powerful Features
        </h3>
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`${
                dark ? "bg-gray-700" : "bg-white"
              } rounded-xl p-6 flex flex-col items-center text-center hover:shadow-2xl transform hover:-translate-y-1 transition`}
            >
              <div className="p-4 bg-gray-900 rounded-full mb-4">
                <FontAwesomeIcon
                  icon={f.icon}
                  className="text-purple-500 text-2xl"
                />
              </div>
              <h4 className="text-xl font-semibold mb-2">{f.title}</h4>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className={`${dark ? "bg-gray-900" : "bg-gray-50"} py-16`}
      >
        <h3 className="text-3xl font-bold text-center mb-10">
          Frequently Asked Questions
        </h3>
        <div className="max-w-3xl mx-auto space-y-4 px-4">
          {[
            {
              q: "How do I sign up?",
              a: "Click Sign Up, fill the form, and start exploring.",
            },
            {
              q: "Is there a free tier?",
              a: "Yes, core features are free. Premium adds advanced analytics.",
            },
            {
              q: "Can I switch themes?",
              a: "Use the sun/moon icon to toggle light/dark modes.",
            },
            {
              q: "How secure is my data?",
              a: "We use encryption and never share your personal info.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="border border-gray-600 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className={`${
                  dark
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-100"
                } w-full flex justify-between items-center px-4 py-3 transition`}
              >
                {item.q}
                <FontAwesomeIcon icon={openFaq === idx ? faTimes : faBars} />
              </button>
              {openFaq === idx && (
                <div
                  className={`${
                    dark
                      ? "bg-gray-700 text-gray-200"
                      : "bg-gray-50 text-gray-700"
                  } px-4 py-3`}
                >
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`${
          dark ? "bg-gray-800" : "bg-gray-100"
        } py-6 text-center text-sm ${dark ? "text-gray-500" : "text-gray-600"}`}
      >
        © {new Date().getFullYear()} Synapse. All rights reserved.
      </footer>

      {/* Floating bubbles animation */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0) }
          50% { transform: translateY(-20px) }
          100% { transform: translateY(0) }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
