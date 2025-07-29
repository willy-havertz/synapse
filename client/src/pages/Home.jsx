
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import ThemeContext from "../contexts/ThemeContext";
import CountUp from "react-countup";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  faComments,
  faCamera,
  faCloudSun,
  faMobileAlt,
  faRocket,
  faChartBar,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const featureData = [
  {
    title: "Real-time Chat",
    icon: faComments,
    to: "/chat",
    desc: "Connect with friends instantly",
  },
  {
    title: "Photo Analyzer",
    icon: faCamera,
    to: "/photo-analyzer",
    desc: "AI-powered beauty detection",
  },
  {
    title: "Weather Dashboard",
    icon: faCloudSun,
    to: "/weather",
    desc: "Accurate weather forecasts",
  },
  {
    title: "Device Inspector",
    icon: faMobileAlt,
    to: "/device-inspector",
    desc: "Device health metrics",
  },
  {
    title: "Tech Trends",
    icon: faRocket,
    to: "/tech-trends",
    desc: "Latest tech insights",
  },
  {
    title: "Analytics",
    icon: faChartBar,
    to: "/analytics",
    desc: "Detailed engagement stats",
  },
];

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6 },
  }),
};

export default function Home() {
  const { user } = useContext(AuthContext);
  const { dark } = useContext(ThemeContext);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // Faux stats load
  useEffect(() => {
    setTimeout(() => {
      setStats({
        users: 50000,
        messages: 690000,
        photos: 100000,
        uptime: 99.9,
      });
    }, 500);
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div
      className={`${
        dark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      } min-h-screen px-6 py-12`}
    >
      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="visible"
        custom={0}
        variants={variants}
        className={`${
          dark ? "bg-gray-800" : "bg-gray-100"
        } relative overflow-hidden rounded-2xl p-12 text-center shadow-2xl`}
      >
        <h1 className="mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 text-5xl font-extrabold">
          {greeting}, {user.name}!
        </h1>
        <p className="mb-8 text-lg text-gray-400 max-w-2xl mx-auto">
          Explore our features and see your stats in real time.
        </p>
        <div className="mb-6 flex flex-col sm:flex-row justify-center gap-4">
          {featureData.slice(0, 2).map((f, i) => (
            <motion.div
              key={i}
              custom={i + 1}
              variants={variants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={f.to}
                className="inline-flex items-center px-6 py-3 rounded-full font-semibold shadow-lg transition bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 focus:ring-2 focus:ring-purple-500"
              >
                <FontAwesomeIcon icon={f.icon} className="mr-2" />
                {f.title}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section
        initial="hidden"
        animate="visible"
        custom={1}
        variants={variants}
        className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: "Active Users", val: stats?.users, suffix: "+" },
          { label: "Messages Sent", val: stats?.messages, suffix: "+" },
          { label: "Photos Analyzed", val: stats?.photos, suffix: "+" },
          { label: "Uptime", val: stats?.uptime, suffix: "%" },
        ].map((s, i) => (
          <motion.div
            key={i}
            custom={i + 2}
            variants={variants}
            whileHover={{ y: -5 }}
            className={`${
              dark ? "bg-gray-800" : "bg-gray-100"
            } rounded-xl p-6 text-center transition-all hover:border-purple-500 hover:shadow-xl`}
          >
            {s.val != null ? (
              <CountUp
                end={s.val}
                suffix={s.suffix}
                duration={1.5}
                className="text-4xl font-bold text-purple-400"
              />
            ) : (
              <div className="mb-2 h-10 w-full animate-pulse rounded bg-gray-700" />
            )}
            <p className="mt-2 text-gray-400 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Features */}
      <motion.section
        initial="hidden"
        animate="visible"
        custom={2}
        variants={variants}
        className="mt-16"
      >
        <h2 className="mb-2 text-4xl font-bold text-center">
          Powerful Features
        </h2>
        <p className="mb-10 text-center text-gray-400 max-w-2xl mx-auto">
          Discover everything our platform has to offer
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureData.map((f, i) => (
            <motion.div
              key={i}
              custom={i + 3}
              variants={variants}
              whileHover={{ scale: 1.03 }}
              className={`${
                dark ? "bg-gray-800" : "bg-gray-100"
              } rounded-xl p-6 transition-all hover:border-purple-500 hover:shadow-lg`}
            >
              <Link to={f.to} className="flex flex-col h-full">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-700 transition group-hover:bg-purple-700">
                  <FontAwesomeIcon
                    icon={f.icon}
                    className="text-purple-400 text-xl group-hover:text-white"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold transition group-hover:text-purple-400">
                  {f.title}
                </h3>
                <p className="flex-1 text-gray-400">{f.desc}</p>
                <span className="mt-4 font-medium text-purple-400 group-hover:underline">
                  Explore →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial="hidden"
        animate="visible"
        custom={3}
        variants={variants}
        className={`${
          dark ? "bg-gray-800" : "bg-gray-100"
        } mt-16 rounded-2xl p-8 text-center`}
      >
        <motion.div
          custom={4}
          variants={variants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-700 p-4"
        >
          <FontAwesomeIcon icon={faBolt} className="text-white text-2xl" />
        </motion.div>
        <motion.h2
          custom={5}
          variants={variants}
          className={`${
            dark ? "text-gray-100" : "text-gray-900"
          } mb-4 text-3xl font-bold`}
        >
          Ready to Get Started?
        </motion.h2>
        <motion.p
          custom={6}
          variants={variants}
          className="mb-4 text-gray-400 max-w-xl mx-auto"
        >
          You’re already signed in—why not update your settings?
        </motion.p>
        <motion.button
          onClick={() => navigate("/settings")}
          custom={7}
          variants={variants}
          whileHover={{ scale: 1.05 }}
          className="mx-auto inline-block rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-3 font-semibold shadow-lg transition focus:ring-2 focus:ring-purple-500"
        >
          Go to Settings
        </motion.button>
      </motion.section>
    </div>
  );
}
