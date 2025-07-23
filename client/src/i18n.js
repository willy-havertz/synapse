// src/i18n.js

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "es", "fr", "de"],
    debug: false,
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator"],
      caches: ["cookie"],
    },
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
      requestOptions: {
        cache: "no-store",
      },
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
