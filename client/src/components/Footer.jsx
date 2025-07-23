import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#1f1f1f] shadow-inner border-t border-gray-800">
      <div className="max-w-6xl mx-auto py-4 px-6 flex flex-col sm:flex-row items-center justify-between text-gray-400 text-sm">
        <p>
          © {new Date().getFullYear()} Synapse. All rights reserved. Wiltord
        </p>
        <div className="mt-2 sm:mt-0">
          <a href="/privacy" className="hover:text-white transition mx-2">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-white transition mx-2">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
