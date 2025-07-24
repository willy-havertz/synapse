
import React, { useContext, useState } from "react";
import ThemeContext from "../contexts/ThemeContext";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";

// Inline “X” (formerly Twitter) logo SVG
const XIcon = (props) => (
  <svg
    {...props}
    role="img"
    viewBox="0 0 248 204"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M248 24.3c-9.1 4.1-18.8 6.8-29 8 10.4-6.2 18.3-16 22-27.8-9.7 5.7-20.5 9.8-32 12-9.2-9.8-22.3-15.9-36.8-15.9-27.9 0-50.6 22.6-50.6 50.5 0 4 .4 7.8 1.3 11.5-42.1-2.1-79.4-22.3-104.4-53-4.4 7.6-6.9 16.5-6.9 26 0 17.9 9.1 33.7 23 43-8.5-.3-16.5-2.6-23.5-6.5v.6c0 25.1 17.9 46 41.6 50.8-4.3 1.2-8.9 1.8-13.6 1.8-3.3 0-6.5-.3-9.6-.9 6.5 20.3 25.2 35.1 47.4 35.6-17.4 13.6-39.3 21.7-63.1 21.7-4.1 0-8.2-.2-12.2-.7 22.6 14.5 49.5 23 78.3 23 94 0 145.4-77.9 145.4-145.4 0-2.2-.1-4.3-.2-6.4 10-7.2 18.7-16.2 25.6-26.4z"
    />
  </svg>
);

export default function Footer() {
  const { dark } = useContext(ThemeContext);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Subscribed ${email}!`);
    setEmail("");
  };

  return (
    <footer
      className={`${
        dark ? "bg-gray-900 text-gray-300" : "bg-gray-50 text-gray-700"
      } border-t ${dark ? "border-gray-800" : "border-gray-200"} pt-10`}
    >
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Branding & Contact */}
        <div>
          <h3 className="text-xl font-bold mb-2">Synapse</h3>
          <p className="text-sm mb-4">
            Building next‑gen real‑time chat & analytics.
          </p>
          <p className="flex items-center text-sm mb-1">
            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
            <a href="mailto:support@synapse.com" className="hover:underline">
              support@synapse.com
            </a>
          </p>
          <p className="flex items-center text-sm">
            <FontAwesomeIcon icon={faPhone} className="mr-2" />
            +1 (555) 123‑4567
          </p>
        </div>

        {/* Quick Links */}
        <nav aria-label="Quick links">
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/features" className="hover:text-purple-600 transition">
                Features
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-purple-600 transition">
                About
              </Link>
            </li>
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-label="Legal">
          <h4 className="font-semibold mb-2">Legal</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/privacy" className="hover:text-purple-600 transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-purple-600 transition">
                Terms of Service
              </Link>
            </li>
          </ul>
        </nav>

        {/* Newsletter & Social */}
        <div className="space-y-4">
          <h4 className="font-semibold mb-2">Stay Updated</h4>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-2"
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`flex-1 px-3 py-2 rounded border ${
                dark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white transition"
            >
              Subscribe
            </button>
          </form>
          <div className="flex space-x-4 text-lg">
            <a
              href="https://facebook.com/YourPage"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-purple-600 transition"
            >
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a
              href="https://x.com/YourHandle"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="hover:text-purple-600 transition"
            >
              <XIcon className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/YourRepo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-purple-600 transition"
            >
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className={`mt-10 border-t ${
          dark ? "border-gray-800" : "border-gray-200"
        }
                      text-center py-4 text-xs`}
      >
        © {new Date().getFullYear()} Synapse. All rights reserved.
      </div>
    </footer>
  );
}
