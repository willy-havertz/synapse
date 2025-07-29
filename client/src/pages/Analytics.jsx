import React, { useState, useEffect, useCallback, useContext } from "react";
import ThemeContext from "../contexts/ThemeContext";
import api from "../services/api";
import {
  faChartLine,
  faSyncAlt,
  faCalendarAlt,
  faDownload,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Quick ranges
const QUICK_RANGES = [
  { label: "7 d", days: 7 },
  { label: "30 d", days: 30 },
  { label: "90 d", days: 90 },
];

// Chart colors
const CHART_COLORS = {
  line: "#82ca9d",
  bar: "#8884d8",
  pie: ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1"],
};

// Helpers
const shiftDate = (daysAgo) =>
  new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);

const downloadCSV = (rows = [], filename = "data.csv", headers = []) => {
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => r[h]).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Loading pulse placeholder
const LoadingPlaceholder = ({ count = 1, className = "h-20" }) =>
  Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={`${className} rounded-lg animate-pulse bg-gray-700`}
    />
  ));

// Controls component
function Controls({ range, onQuick, onRefresh, onExport }) {
  const { dark } = useContext(ThemeContext);
  const activeDays = QUICK_RANGES.find(
    (r) => shiftDate(r.days) === range.start
  )?.days;

  return (
    <div className="flex flex-wrap items-center space-x-2">
      {QUICK_RANGES.map((r) => (
        <button
          key={r.label}
          onClick={() => onQuick(r.days)}
          className={`px-3 py-1 rounded text-sm transition ${
            activeDays === r.days
              ? "bg-purple-600 text-white"
              : dark
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {r.label}
        </button>
      ))}

      <div
        className={`flex items-center rounded px-3 py-2 ${
          dark ? "bg-gray-700" : "bg-gray-200"
        }`}
      >
        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
        <input
          type="date"
          value={range.start}
          onChange={(e) => onQuick(null, { start: e.target.value })}
          className={`bg-transparent text-sm focus:outline-none ${
            dark
              ? "text-white placeholder-gray-400"
              : "text-black placeholder-gray-600"
          }`}
        />
        <span className="mx-2 text-gray-500">→</span>
        <input
          type="date"
          value={range.end}
          onChange={(e) => onQuick(null, { end: e.target.value })}
          className={`bg-transparent text-sm focus:outline-none ${
            dark
              ? "text-white placeholder-gray-400"
              : "text-black placeholder-gray-600"
          }`}
        />
      </div>

      <button
        onClick={onRefresh}
        className={`p-2 rounded transition ${
          dark
            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
        title="Refresh"
      >
        <FontAwesomeIcon icon={faSyncAlt} />
      </button>

      <button
        onClick={() => onExport("overview")}
        className={`p-2 rounded transition ${
          dark
            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
        title="Download Overview CSV"
      >
        <FontAwesomeIcon icon={faDownload} />
      </button>
    </div>
  );
}

// StatCards
function StatCards({ stats, loading }) {
  const { dark } = useContext(ThemeContext);
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <LoadingPlaceholder
          count={4}
          className={dark ? "bg-gray-700" : "bg-gray-200"}
        />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(stats).map(([key, val]) => {
        // simple icon selection
        const iconMap = {
          users: faChartLine,
          pages: faChartLine,
          views: faChartLine,
          visits: faChartLine,
        };
        const Icon = iconMap[key.toLowerCase()] || faChartLine;
        return (
          <div
            key={key}
            className={`p-4 rounded-lg flex items-center space-x-4 transition hover:shadow-lg ${
              dark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <FontAwesomeIcon icon={Icon} className="text-purple-400 text-xl" />
            <div>
              <p
                className={`${
                  dark ? "text-gray-400" : "text-gray-600"
                } text-sm`}
              >
                {key.replace(/([A-Z])/g, " $1")}
              </p>
              <p
                className={`${
                  dark ? "text-white" : "text-gray-900"
                } text-2xl font-semibold`}
              >
                {val}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// VisitorsChart
function VisitorsChart({ data, loading }) {
  const { dark } = useContext(ThemeContext);
  const tooltipStyle = {
    backgroundColor: dark ? "#2a2a2a" : "#ffffff",
    border: "none",
    color: dark ? "#f9fafb" : "#1f1f1f",
  };
  return (
    <div
      className={`p-4 rounded-lg min-h-[220px] ${
        dark ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h2
        className={`${
          dark ? "text-white" : "text-gray-900"
        } mb-2 text-lg font-semibold`}
      >
        Visitors Over Time
      </h2>
      {loading ? (
        <LoadingPlaceholder />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              stroke={dark ? "#9ca3af" : "#4b5563"}
              tick={{ fontSize: 12, fill: dark ? "#f3f4f6" : "#1f2937" }}
            />
            <YAxis
              stroke={dark ? "#9ca3af" : "#4b5563"}
              tick={{ fontSize: 12, fill: dark ? "#f3f4f6" : "#1f2937" }}
            />
            <ReTooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: dark ? "#f3f4f6" : "#1f2937" }}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke={CHART_COLORS.line}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// TopPagesChart
function TopPagesChart({ data, loading, onExport }) {
  const { dark } = useContext(ThemeContext);
  const tooltipStyle = {
    backgroundColor: dark ? "#2a2a2a" : "#ffffff",
    border: "none",
    color: dark ? "#f9fafb" : "#1f1f1f",
  };
  return (
    <div
      className={`p-4 rounded-lg min-h-[220px] ${
        dark ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="mb-2 flex justify-between items-center">
        <h2
          className={`${
            dark ? "text-white" : "text-gray-900"
          } text-lg font-semibold`}
        >
          Top Pages
        </h2>
        <button
          onClick={() => onExport("pages")}
          className={`${
            dark
              ? "text-gray-300 hover:text-white"
              : "text-gray-700 hover:text-black"
          } text-sm`}
        >
          Export
        </button>
      </div>
      {loading ? (
        <LoadingPlaceholder />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis
              dataKey="page"
              stroke={dark ? "#9ca3af" : "#4b5563"}
              tick={{
                fontSize: 12,
                fill: dark ? "#f3f4f6" : "#1f2937",
                angle: -45,
                textAnchor: "end",
              }}
            />
            <YAxis
              stroke={dark ? "#9ca3af" : "#4b5563"}
              tick={{ fontSize: 12, fill: dark ? "#f3f4f6" : "#1f2937" }}
            />
            <ReTooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: dark ? "#f3f4f6" : "#1f2937" }}
            />
            <Bar dataKey="views" fill={CHART_COLORS.bar} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// SourcesChart
function SourcesChart({ data, loading, onExport }) {
  const { dark } = useContext(ThemeContext);
  const tooltipStyle = {
    backgroundColor: dark ? "#2a2a2a" : "#ffffff",
    border: "none",
    color: dark ? "#f9fafb" : "#1f1f1f",
  };

  const getPath = (fullUrl) => {
    try {
      return new URL(fullUrl).pathname;
    } catch {
      return fullUrl;
    }
  };

  return (
    <div
      className={`p-4 rounded-lg min-h-[220px] ${
        dark ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="mb-2 flex justify-between items-center">
        <h2
          className={`${
            dark ? "text-white" : "text-gray-900"
          } text-lg font-semibold`}
        >
          Traffic Sources
        </h2>
        <button
          onClick={() => onExport("sources")}
          className={`${
            dark
              ? "text-gray-300 hover:text-white"
              : "text-gray-700 hover:text-black"
          } text-sm`}
        >
          Export
        </button>
      </div>
      {loading ? (
        <LoadingPlaceholder />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label={false}
                labelLine={false}
              >
                {data.map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={CHART_COLORS.pie[idx % CHART_COLORS.pie.length]}
                  />
                ))}
              </Pie>
              <ReTooltip
                formatter={(value, fullUrl) => [value, getPath(fullUrl)]}
                contentStyle={tooltipStyle}
                itemStyle={{ color: dark ? "#f3f4f6" : "#1f2937" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap">
            {data.map((item, idx) => {
              const path = getPath(item.source);
              return (
                <div key={idx} className="mr-6 mb-2 flex items-center">
                  <span
                    className="mr-2 inline-block h-3 w-3 rounded-sm"
                    style={{
                      backgroundColor:
                        CHART_COLORS.pie[idx % CHART_COLORS.pie.length],
                    }}
                  />
                  <span
                    className={`${
                      dark ? "text-gray-300" : "text-gray-700"
                    } text-sm`}
                  >
                    {path}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function Analytics() {
  const { dark } = useContext(ThemeContext);

  const [stats, setStats] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);
  const [pagesData, setPagesData] = useState([]);
  const [sourcesData, setSourcesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [range, setRange] = useState({
    start: shiftDate(7),
    end: shiftDate(0),
  });

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ovr, ts, pg, src] = await Promise.all([
        api.get("/analytics/overview", { params: range }),
        api.get("/analytics/visitors", { params: range }),
        api.get("/analytics/top-pages", { params: range }),
        api.get("/analytics/sources", { params: range }),
      ]);
      setStats(ovr.data);
      setTimeSeries(ts.data);
      setPagesData(pg.data);
      setSourcesData(src.data);
    } catch {
      setError("Failed to load analytics. Try again.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleQuick = (days, custom = {}) => {
    if (days != null) {
      setRange({ start: shiftDate(days), end: shiftDate(0) });
    } else {
      setRange((r) => ({ ...r, ...custom }));
    }
  };

  const handleExport = (type) => {
    toast.info("Downloading...", {
      position: "top-right",
      theme: dark ? "dark" : "light",
      toastId: "download-progress",
      autoClose: false,
    });
    let rows, filename, headers;
    if (type === "overview" && stats) {
      rows = Object.entries(stats).map(([metric, value]) => ({
        metric,
        value,
      }));
      filename = `overview_${range.start}_to_${range.end}.csv`;
      headers = ["metric", "value"];
    } else if (type === "pages") {
      rows = pagesData;
      filename = `top-pages_${range.start}_to_${range.end}.csv`;
      headers = ["page", "views"];
    } else if (type === "sources") {
      rows = sourcesData;
      filename = `sources_${range.start}_to_${range.end}.csv`;
      headers = ["source", "value"];
    }
    if (rows) {
      setTimeout(() => {
        downloadCSV(rows, filename, headers);

        toast.dismiss("download-progress");

        toast.success("Download complete", {
          position: "top-right",
          theme: dark ? "dark" : "light",
        });
      }, 1200);
    }
  };

  if (error) {
    return <p className="py-10 text-center text-red-500">{error}</p>;
  }

  return (
    <div className={`${dark ? "bg-gray-900" : "bg-gray-50"} space-y-6 p-6`}>
      <ToastContainer autoClose={2000} />

      {/* Header + Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon
            icon={faChartLine}
            className="text-purple-400 text-2xl"
          />
          <h1
            className={`${
              dark ? "text-white" : "text-gray-900"
            } text-3xl font-bold`}
          >
            Analytics Overview
          </h1>
          {loading && (
            <FontAwesomeIcon
              icon={faSpinner}
              className="ml-2 animate-spin text-gray-400"
            />
          )}
        </div>
        <Controls
          range={range}
          onQuick={handleQuick}
          onRefresh={fetchAnalytics}
          onExport={handleExport}
        />
      </div>

      {/* Summary Cards */}
      <StatCards stats={stats} loading={loading} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <VisitorsChart data={timeSeries} loading={loading} />
        <TopPagesChart
          data={pagesData}
          loading={loading}
          onExport={handleExport}
        />
        <SourcesChart
          data={sourcesData}
          loading={loading}
          onExport={handleExport}
        />
      </div>
    </div>
  );
}
