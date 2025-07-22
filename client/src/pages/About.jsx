// src/pages/About.jsx
import React, { useContext, useRef, useEffect } from "react";
import ThemeContext from "../contexts/ThemeContext";
import ThemeToggle from "../contexts/ThemeToggle";

const TESTIMONIALS = [
  {
    name: "Jane Smith",
    quote:
      "Synapse's real-time analytics helped us double our engagement in just two weeks!",
    avatar: "/testimonials/jane.jpg",
  },
  {
    name: "Carlos Ruiz",
    quote:
      "The AI-powered photo analyzer is magical—our marketing team loves it.",
    avatar: "/testimonials/carlos.jpg",
  },
  {
    name: "Aisha Khan",
    quote: "Reliable, fast, and easy to use. A must-have toolkit.",
    avatar: "/testimonials/aisha.jpg",
  },
];

const TEAM = [
  {
    name: "Alex Carter",
    role: "Founder & CEO",
    bio: "Built Synapse out of a garage—loves clean code & strong coffee.",
    avatar: "/team/alex.jpg",
  },
  {
    name: "Maya Liu",
    role: "Lead Engineer",
    bio: "Architect of our micro-services & React wizard.",
    avatar: "/team/maya.jpg",
  },
  {
    name: "Ravi Patel",
    role: "AI Researcher",
    bio: "Designing our ML models—PhD in neural networks.",
    avatar: "/team/ravi.jpg",
  },
];

const METRICS = [
  { label: "Active Users", value: "50K+" },
  { label: "Photos Analyzed", value: "200K+" },
  { label: "API Calls / mo", value: "1M+" },
  { label: "Uptime", value: "99.9%" },
];

export default function About() {
  const { dark } = useContext(ThemeContext);
  const containerRef = useRef();

  // scroll‑reveal setup
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          e.target.classList.add("opacity-100", "translate-y-0");
          obs.unobserve(e.target);
        }
      },
      { threshold: 0.2 }
    );
    containerRef.current.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add(
        "opacity-0",
        "translate-y-6",
        "transition-all",
        "duration-700"
      );
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  // dynamic classes
  const bg = dark ? "bg-gray-900" : "bg-gray-50";
  const text = dark ? "text-gray-100" : "text-gray-900";
  const cardBg = dark ? "bg-gray-800" : "bg-white";
  const subtext = dark ? "text-gray-400" : "text-gray-600";
  const border = dark ? "border-gray-700" : "border-gray-200";
  const linkHover = dark ? "hover:text-purple-300" : "hover:text-purple-600";

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
          <a
            href="/"
            className={`font-semibold ${text} ${linkHover} transition`}
          >
            Home
          </a>
          <a href="/terms" className={`${text} ${linkHover} transition`}>
            Terms
          </a>
          <a href="/privacy" className={`${text} ${linkHover} transition`}>
            Privacy
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </nav>

      <main
        ref={containerRef}
        className="max-w-5xl mx-auto px-6 py-12 space-y-24"
      >
        {/* Why We Built It */}
        <section className="reveal">
          <h2 className="text-4xl font-semibold text-purple-500 mb-4">
            Why We Built It
          </h2>
          <p className="text-lg leading-relaxed">
            Tired of scattered AI tools and fragmented dashboards, our founder
            Alex set out to create one unified, intuitive experience. Synapse
            bundles chat, analytics, image insights, and more—so you can focus
            on building without the hassle.
          </p>
        </section>

        {/* Core Metrics */}
        <section className="reveal">
          <h2 className="text-4xl font-semibold text-purple-500 mb-8">
            Our Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {METRICS.map((m, i) => (
              <div
                key={i}
                className={`${cardBg} p-6 rounded-xl shadow hover:shadow-lg transition`}
              >
                <p className="text-4xl font-extrabold text-purple-500">
                  {m.value}
                </p>
                <p className={`mt-2 ${subtext}`}>{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="reveal">
          <h2 className="text-4xl font-semibold text-purple-500 mb-8">
            Testimonials
          </h2>
          <div className="space-y-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={`${cardBg} flex items-start space-x-4 p-6 rounded-2xl shadow hover:shadow-xl transition`}
              >
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-16 h-16 rounded-full border-2 border-purple-500"
                />
                <div>
                  <p className="italic">“{t.quote}”</p>
                  <p className="mt-2 font-semibold">— {t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Profiles */}
        <section className="reveal">
          <h2 className="text-4xl font-semibold text-purple-500 mb-8">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM.map((p, i) => (
              <div
                key={i}
                className={`${cardBg} flex flex-col items-center text-center p-6 rounded-2xl shadow hover:shadow-xl transition`}
              >
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-purple-500"
                />
                <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                <p className="text-purple-500 font-medium mb-3">{p.role}</p>
                <p className={subtext}>{p.bio}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={`py-6 text-center text-sm border-t ${border}`}>
        © {new Date().getFullYear()} Synapse. All rights reserved.
      </footer>
    </div>
  );
}
