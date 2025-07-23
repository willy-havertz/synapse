// src/main.jsx
import React, { Suspense } from "react"; // ← import Suspense
import ReactDOM from "react-dom/client";
import App from "./App";
import AuthProvider from "./contexts/AuthProvider";
import ThemeProvider from "./contexts/ThemeProvider";
import "./index.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./i18n"; 

config.autoAddCss = false;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading…</div>}>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </Suspense>
  </React.StrictMode>
);
