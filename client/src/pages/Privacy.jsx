import React, { useContext } from "react";
import { Link } from "react-router-dom";
import ThemeContext from "../contexts/ThemeContext";
import ThemeToggle from "../contexts/ThemeToggle";
import { useTranslation } from "react-i18next";
import Footer from "../components/Footer";

export default function Privacy() {
  const { dark } = useContext(ThemeContext);
  const { t } = useTranslation();

  const bgClass = dark
    ? "bg-gray-900 text-gray-100"
    : "bg-gray-50 text-gray-900";
  const borderClass = dark ? "border-gray-800" : "border-gray-200";

  const sections = t("privacy.sections", { returnObjects: true });

  return (
    <div className={`${bgClass} min-h-screen flex flex-col`}>
      <nav
        className={`sticky top-0 z-10 backdrop-blur bg-opacity-75 ${borderClass} border-b py-4 px-6 flex justify-between`}
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
          <h1 className="text-4xl font-extrabold mb-4">{t("privacy.title")}</h1>
          <p className="leading-relaxed text-lg">{t("privacy.intro")}</p>
        </section>

        {Object.values(sections).map((sec, idx) => (
          <section key={idx} className="space-y-2">
            <h2 className="text-2xl font-semibold">
              {t(`privacy.sections.${Object.keys(sections)[idx]}.heading`)}
            </h2>
            <p className="leading-relaxed">
              {t(`privacy.sections.${Object.keys(sections)[idx]}.text`)}
            </p>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}
