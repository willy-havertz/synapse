// src/pages/Terms.jsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemeContext from "../contexts/ThemeContext";
import ThemeToggle from "../contexts/ThemeToggle";
import Footer from "../components/Footer";

export default function Terms() {
  const { dark } = useContext(ThemeContext);
  const { t } = useTranslation();
  const sections = t("terms.sections", { returnObjects: true });

  return (
    <div
      className={`${
        dark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      } min-h-screen flex flex-col`}
    >
      <nav
        className={`sticky top-0 z-10 backdrop-blur bg-opacity-75 ${
          dark ? "border-gray-800" : "border-gray-200"
        } border-b py-4 px-6 flex justify-between items-center`}
        style={{
          backgroundColor: dark
            ? "rgba(17,24,39,0.8)"
            : "rgba(255,255,255,0.8)",
        }}
      >
        <Link to="/" className="font-bold text-lg">
          {t("appName")}
        </Link>
        <ThemeToggle />
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 space-y-8">
        <section>
          <h1 className="text-4xl font-extrabold mb-4">{t("terms.title")}</h1>
          <p className="leading-relaxed text-lg">{t("terms.intro")}</p>
        </section>
        {Object.entries(sections).map(([key, { heading, text }]) => (
          <section key={key} className="space-y-2">
            <h2 className="text-2xl font-semibold">{heading}</h2>
            <p className="leading-relaxed">{text}</p>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}
