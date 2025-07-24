
import React, { useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemeContext from "../contexts/ThemeContext";
import ThemeToggle from "../contexts/ThemeToggle";
import Footer from "../components/Footer";


import janeImg from "../assets/testimonials/jane.JPG";
import carlosImg from "../assets/testimonials/carlos.JPG";
import aishaImg from "../assets/testimonials/aisha.JPG";


import willyImg from "../assets/team/willy.JPG";
import hopeImg from "../assets/team/hope.JPG";
import danieliImg from "../assets/team/daniel.JPG";

const TESTIMONIALS = [
  {
    name: "Jane Smith",
    quoteKey: "about.testimonials.jane.quote",
    avatar: janeImg,
  },
  {
    name: "Carlos Ruiz",
    quoteKey: "about.testimonials.carlos.quote",
    avatar: carlosImg,
  },
  {
    name: "Aisha Khan",
    quoteKey: "about.testimonials.aisha.quote",
    avatar: aishaImg,
  },
];

const TEAM = [
  {
    name: "Wiltord Ichingwa",
    roleKey: "about.team.wiltord.role",
    bioKey: "about.team.wiltord.bio",
    avatar: willyImg,
  },
  {
    name: "Hope Grace",
    roleKey: "about.team.hope.role",
    bioKey: "about.team.hope.bio",
    avatar: hopeImg,
  },
  {
    name: "Daniel Kinyanjui",
    roleKey: "about.team.daniel.role",
    bioKey: "about.team.daniel.bio",
    avatar: danieliImg,
  },
];

const METRICS = [
  { labelKey: "about.metrics.activeUsers", value: "50K+" },
  { labelKey: "about.metrics.photosAnalyzed", value: "200K+" },
  { labelKey: "about.metrics.apiCalls", value: "1M+" },
  { labelKey: "about.metrics.uptime", value: "99.9%" },
];

export default function About() {
  const { dark } = useContext(ThemeContext);
  const { t } = useTranslation();
  const containerRef = useRef(null);

  // Theme classes
  const bg = dark ? "bg-gray-900" : "bg-gray-50";
  const text = dark ? "text-gray-100" : "text-gray-900";
  const cardBg = dark ? "bg-gray-800" : "bg-white";
  const subtext = dark ? "text-gray-400" : "text-gray-600";
  const border = dark ? "border-gray-700" : "border-gray-200";
  const linkHover = dark ? "hover:text-purple-300" : "hover:text-purple-600";

  // Scroll‑reveal
  useEffect(() => {
    const els = Array.from(containerRef.current.querySelectorAll(".reveal"));
    els.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(1rem)";
      el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
      el.dataset.delay = String(i * 100);
    });
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.delay);
          el.style.transitionDelay = `${delay}ms`;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          obs.unobserve(el);
        });
      },
      { threshold: 0.2 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className={`${bg} ${text} min-h-screen`}>
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur bg-opacity-80 border-b ${border}`}
        style={{
          backgroundColor: dark
            ? "rgba(17,24,39,0.85)"
            : "rgba(255,255,255,0.85)",
        }}
      >
        <div className="flex items-center space-x-6">
          <Link
            to="/"
            className={`${text} font-semibold ${linkHover} transition`}
          >
            {t("nav.home")}
          </Link>
          <Link to="/terms" className={`${text} ${linkHover} transition`}>
            {t("nav.terms")}
          </Link>
          <Link to="/privacy" className={`${text} ${linkHover} transition`}>
            {t("nav.privacy")}
          </Link>
        </div>
        <ThemeToggle />
      </nav>

      <main
        ref={containerRef}
        className="max-w-5xl mx-auto px-6 py-12 space-y-24"
      >
        {/* Why We Built It */}
        <section className="reveal">
          <h2 className="text-4xl font-semibold text-purple-500 mb-4">
            {t("about.why.title")}
          </h2>
          <p className="text-lg leading-relaxed">{t("about.why.text")}</p>
        </section>

        {/* Core Metrics */}
        <section className="reveal">
          <h2 className="text-4xl font-semibold text-purple-500 mb-8">
            {t("about.metrics.title")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {METRICS.map((m, i) => (
              <div
                key={i}
                className={`${cardBg} p-6 rounded-xl shadow hover:shadow-lg transition reveal`}
              >
                <p className="text-4xl font-extrabold text-purple-500">
                  {m.value}
                </p>
                <p className={`mt-2 ${subtext}`}>{t(m.labelKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="reveal">
          <h2 className="text-4xl font-semibold text-purple-500 mb-8">
            {t("about.testimonials.title")}
          </h2>
          <div className="space-y-6">
            {TESTIMONIALS.map((u, i) => (
              <div
                key={i}
                className={`${cardBg} flex items-start space-x-4 p-6 rounded-2xl shadow hover:shadow-xl transition reveal`}
              >
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-16 h-16 rounded-full border-2 border-purple-500"
                />
                <div>
                  <p className="italic">&ldquo;{t(u.quoteKey)}&rdquo;</p>
                  <p className="mt-2 font-semibold">— {u.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Profiles */}
        <section className="reveal">
          <h2 className="text-4xl font-semibold text-purple-500 mb-8">
            {t("about.team.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM.map((p, i) => (
              <div
                key={i}
                className={`${cardBg} flex flex-col items-center text-center p-6 rounded-2xl shadow hover:shadow-xl transition reveal`}
              >
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-purple-500"
                />
                <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                <p className="text-purple-500 font-medium mb-3">
                  {t(p.roleKey)}
                </p>
                <p className={subtext}>{t(p.bioKey)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
