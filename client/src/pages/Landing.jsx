import React, { useContext, useState, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemeContext from "../contexts/ThemeContext";
import ThemeToggle from "../contexts/ThemeToggle";
import { FontAwesomeIcon as FAIcon } from "@fortawesome/react-fontawesome";
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
    key: "features.realTimeChat",
    descKey: "features.realTimeChatDesc",
  },
  {
    icon: faCamera,
    key: "features.photoAnalyzer",
    descKey: "features.photoAnalyzerDesc",
  },
  {
    icon: faCloudSun,
    key: "features.weatherDashboard",
    descKey: "features.weatherDashboardDesc",
  },
  {
    icon: faMobileAlt,
    key: "features.deviceInspector",
    descKey: "features.deviceInspectorDesc",
  },
  {
    icon: faRocket,
    key: "features.techTrends",
    descKey: "features.techTrendsDesc",
  },
  {
    icon: faChartBar,
    key: "features.analytics",
    descKey: "features.analyticsDesc",
  },
];

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export default function Landing() {
  const { dark } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const currentLang =
    LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  // Observe sections for nav highlighting
  useEffect(() => {
    const ids = ["hero", "features", "faq"];
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        }),
      { threshold: 0.6 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
    setMenuOpen(false);
  };

  return (
    <div
      id="landing-root"
      className={`
        ${dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}
        min-h-screen flex flex-col overflow-y-scroll snap-y snap-mandatory
      `}
    >
      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between p-6 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-extrabold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            {t("appName")}
          </span>
        </h1>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => scrollTo("features")}
            className={`transition ${
              activeSection === "features"
                ? "text-purple-400 font-bold"
                : "hover:text-purple-500"
            }`}
          >
            {t("nav.features")}
          </button>
          <button
            onClick={() => scrollTo("faq")}
            className={`transition ${
              activeSection === "faq"
                ? "text-purple-400 font-bold"
                : "hover:text-purple-500"
            }`}
          >
            {t("nav.faq")}
          </button>
          <Link to="/about" className="hover:text-purple-500 transition">
            {t("nav.about")}
          </Link>

          {/* Language picker */}
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
              <span className="text-xl">{currentLang.flag}</span>
              <span className="text-sm">{currentLang.code.toUpperCase()}</span>
            </button>
            {langOpen && (
              <ul
                className={`absolute right-0 mt-2 w-32 rounded-lg overflow-hidden shadow-lg ${
                  dark ? "bg-gray-800" : "bg-white"
                }`}
              >
                {LANGUAGES.map((l) => (
                  <li key={l.code}>
                    <button
                      onClick={() => changeLang(l.code)}
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
            {t("nav.signIn")}
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 border border-purple-500 hover:bg-purple-500 rounded-full transition"
          >
            {t("nav.signUp")}
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-700 transition"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <FAIcon icon={menuOpen ? faTimes : faBars} size="lg" />
        </button>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className={`
              ${dark ? "bg-gray-800" : "bg-white"}
              absolute top-full inset-x-0 shadow-lg flex flex-col items-center space-y-4 py-6 md:hidden
            `}
          >
            {/* Mobile language picker */}
            <div className="relative w-32">
              <button
                onClick={() => setLangOpen((o) => !o)}
                className={`
                  flex items-center justify-between w-full px-3 py-2 rounded-full border transition
                  ${
                    dark
                      ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                      : "bg-white border-gray-300 hover:border-gray-400"
                  }
                `}
              >
                <span className="text-xl">{currentLang.flag}</span>
                <span className="text-sm">
                  {currentLang.code.toUpperCase()}
                </span>
                <FAIcon icon={langOpen ? faTimes : faBars} />
              </button>
              {langOpen && (
                <ul
                  className={`absolute left-0 mt-1 w-full rounded-lg overflow-hidden shadow-lg z-10 ${
                    dark ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  {LANGUAGES.map((l) => (
                    <li key={l.code}>
                      <button
                        onClick={() => changeLang(l.code)}
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

            <button
              onClick={() => scrollTo("features")}
              className="hover:text-purple-500 text-lg"
            >
              {t("nav.features")}
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="hover:text-purple-500 text-lg"
            >
              {t("nav.faq")}
            </button>
            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="hover:text-purple-500 text-lg"
            >
              {t("nav.about")}
            </Link>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full transition"
            >
              {t("nav.signIn")}
            </Link>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="px-6 py-2 border border-purple-500 hover:bg-purple-500 rounded-full transition"
            >
              {t("nav.signUp")}
            </Link>
            <ThemeToggle />
          </div>
        )}
      </nav>

      {/* Hero */}
      <header
        id="hero"
        className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden snap-start"
      >
        <h2 className="text-5xl sm:text-6xl font-extrabold mb-4 z-10">
          {t("hero.welcome", { appName: t("appName") })}
        </h2>
        <p className="text-lg sm:text-xl max-w-2xl mb-8 z-10">
          {t("hero.tagline")}
        </p>
        <div className="space-x-4 z-10">
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:scale-105 rounded-full text-lg font-semibold shadow-lg transition"
          >
            <FAIcon icon={faBolt} className="mr-2" />
            {t("hero.getStarted")}
          </Link>
          <button
            onClick={() => scrollTo("features")}
            className="inline-flex items-center px-6 py-4 border border-gray-500 hover:border-purple-500 rounded-full text-gray-400 hover:text-gray-100 transform hover:scale-105 transition pulse-slow"
          >
            {t("hero.discoverFeatures")}
          </button>
        </div>
      </header>

      {/* Features */}
      <section
        id="features"
        className={`${dark ? "bg-gray-800" : "bg-gray-100"} py-16 snap-start`}
      >
        <h3 className="text-3xl font-bold text-center mb-10">
          {t("features.title")}
        </h3>
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`${
                dark ? "bg-gray-700" : "bg-white"
              } rounded-xl p-6 flex flex-col items-center text-center hover:shadow-2xl transform hover:-translate-y-1 transition`}
            >
              <Suspense
                fallback={
                  <div className="h-8 w-8 mb-4 bg-gray-400 rounded-full" />
                }
              >
                <FAIcon
                  icon={f.icon}
                  className="text-purple-500 text-2xl mb-4"
                />
              </Suspense>
              <h4 className="text-xl font-semibold mb-2">{t(f.key)}</h4>
              <p className="text-gray-400">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className={`${dark ? "bg-gray-900" : "bg-gray-50"} py-16 snap-start`}
      >
        <h3 className="text-3xl font-bold text-center mb-10">
          {t("faq.title")}
        </h3>
        <div className="max-w-3xl mx-auto space-y-4 px-4">
          {t("faq.items", { returnObjects: true }).map((item, idx) => (
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
                <FAIcon icon={openFaq === idx ? faTimes : faBars} />
              </button>
              {openFaq === idx && (
                <div
                  className={`px-4 py-3 ${
                    dark
                      ? "bg-gray-700 text-gray-200"
                      : "bg-gray-50 text-gray-700"
                  }`}
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
        } py-6 text-center text-sm ${
          dark ? "text-gray-500" : "text-gray-600"
        } snap-start`}
      >
        {t("footer.copy", { year: new Date().getFullYear() })}
      </footer>

      <style>{`
        @keyframes float{0%{transform:translateY(0)}50%{transform:translateY(-20px)}100%{transform:translateY(0)}}
        .animate-float{animation:float ease-in-out infinite}
        @keyframes pulse-slow{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        .pulse-slow{animation:pulse-slow 3s ease-in-out infinite}
      `}</style>
    </div>
  );
}
