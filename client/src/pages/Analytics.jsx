// src/pages/Analytics.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api";
import {
  faUsers,
  faChartLine,
  faFileAlt,
  faShareAlt,
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

// -- Constants & Helpers --

const QUICK_RANGES = [
  { label: "7 d", days: 7 },
  { label: "30 d", days: 30 },
  { label: "90 d", days: 90 },
];

const CHART_COLORS = {
  line: "#82ca9d",
  bar: "#8884d8",
  pie: ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1"],
};

// shift date by N days ago, formatted YYYY‑MM‑DD
const shiftDate = (daysAgo = 0) =>
  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

// universal CSV downloader
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

// icon picker for stats cards
const iconMap = {
  users: faUsers,
  pages: faFileAlt,
  views: faFileAlt,
  visits: faShareAlt,
  sessions: faShareAlt,
};

// -- Sub‐components --

const LoadingPlaceholder = ({ count = 1, className = "h-20" }) =>
  Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={`${className} bg-gray-700 rounded-lg animate-pulse`}
    />
  ));

const Controls = ({ range, onQuick, onRefresh, onExport }) => {
  const activeDays = useMemo(
    () => QUICK_RANGES.find((r) => shiftDate(r.days) === range.start)?.days,
    [range]
  );

  return (
    <div className="flex flex-wrap items-center space-x-2">
      {QUICK_RANGES.map((r) => (
        <button
          key={r.label}
          onClick={() => onQuick(r.days)}
          className={`px-3 py-1 rounded text-sm transition
            ${
              activeDays === r.days
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
        >
          {r.label}
        </button>
      ))}

      <div className="flex items-center bg-gray-800 rounded px-3 py-2">
        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mr-2" />
        <input
          type="date"
          value={range.start}
          onChange={(e) => onQuick(null, { start: e.target.value })}
          className="bg-transparent text-gray-100 text-sm focus:outline-none"
        />
        <span className="mx-2 text-gray-500">→</span>
        <input
          type="date"
          value={range.end}
          onChange={(e) => onQuick(null, { end: e.target.value })}
          className="bg-transparent text-gray-100 text-sm focus:outline-none"
        />
      </div>

      <button
        onClick={onRefresh}
        className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition"
        title="Refresh"
      >
        <FontAwesomeIcon icon={faSyncAlt} className="text-gray-300" />
      </button>

      <button
        onClick={() => onExport("overview")}
        className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition"
        title="Download Overview CSV"
      >
        <FontAwesomeIcon icon={faDownload} className="text-gray-300" />
      </button>
    </div>
  );
};

const StatCards = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <LoadingPlaceholder count={4} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(stats).map(([key, val]) => {
        const label = key.replace(/([A-Z])/g, " $1");
        const iconKey = Object.keys(iconMap).find((k) =>
          new RegExp(k, "i").test(key)
        );
        return (
          <div
            key={key}
            className="bg-gray-800 p-4 rounded-lg flex items-center space-x-4 hover:shadow-lg transition"
            title={label}
          >
            <FontAwesomeIcon
              icon={iconMap[iconKey] || faChartLine}
              className="text-purple-400 text-xl"
            />
            <div>
              <p className="text-gray-400 text-sm">{label}</p>
              <p className="text-white text-2xl font-semibold">{val}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const VisitorsChart = ({ data, loading }) => (
  <div className="bg-gray-800 p-4 rounded-lg min-h-[220px]">
    <h2 className="text-lg font-semibold mb-2 text-white">
      Visitors Over Time
    </h2>
    {loading ? (
      <LoadingPlaceholder />
    ) : (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 12 }} />
          <YAxis stroke="#888" tick={{ fontSize: 12 }} />
          <ReTooltip
            contentStyle={{ backgroundColor: "#2a2a2a", border: "none" }}
            itemStyle={{ color: "#fff" }}
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

const TopPagesChart = ({ data, loading, onExport }) => (
  <div className="bg-gray-800 p-4 rounded-lg min-h-[220px]">
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-lg font-semibold text-white">Top Pages</h2>
      <button
        onClick={() => onExport("pages")}
        className="text-gray-300 hover:underline text-sm"
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
            stroke="#888"
            tick={{ fontSize: 12, angle: -45, textAnchor: "end" }}
          />
          <YAxis stroke="#888" tick={{ fontSize: 12 }} />
          <ReTooltip
            contentStyle={{ backgroundColor: "#2a2a2a", border: "none" }}
            itemStyle={{ color: "#fff" }}
          />
          <Bar dataKey="views" fill={CHART_COLORS.bar} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
);

const SourcesChart = ({ data, loading, onExport }) => (
  <div className="bg-gray-800 p-4 rounded-lg min-h-[220px]">
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-lg font-semibold text-white">Traffic Sources</h2>
      <button
        onClick={() => onExport("sources")}
        className="text-gray-300 hover:underline text-sm"
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
              formatter={(value, name) => {
                let path;
                try {
                  path = new URL(name).pathname;
                } catch {
                  path = name;
                }
                return [value, path];
              }}
              contentStyle={{ backgroundColor: "#2a2a2a", border: "none" }}
              itemStyle={{ color: "#fff" }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 flex flex-wrap">
          {data.map((item, idx) => {
            let path;
            try {
              path = new URL(item.source).pathname;
            } catch {
              path = item.source;
            }
            return (
              <div key={idx} className="flex items-center mr-6 mb-2">
                <span
                  className="w-3 h-3 inline-block mr-2 rounded-sm"
                  style={{
                    backgroundColor:
                      CHART_COLORS.pie[idx % CHART_COLORS.pie.length],
                  }}
                />
                <span className="text-gray-300 text-sm">{path}</span>
              </div>
            );
          })}
        </div>
      </>
    )}
  </div>
);

// -- Main Page Component --

export default function Analytics() {
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
    switch (type) {
      case "overview":
        return downloadCSV(
          Object.entries(stats).map(([metric, value]) => ({ metric, value })),
          `overview_${range.start}_to_${range.end}.csv`,
          ["metric", "value"]
        );
      case "pages":
        return downloadCSV(
          pagesData,
          `top-pages_${range.start}_to_${range.end}.csv`,
          ["page", "views"]
        );
      case "sources":
        return downloadCSV(
          sourcesData,
          `sources_${range.start}_to_${range.end}.csv`,
          ["source", "value"]
        );
      default:
        return;
    }
  };

  if (error) {
    return <p className="text-center text-red-500 py-10">{error}</p>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header + Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon
            icon={faChartLine}
            className="text-purple-400 text-2xl"
          />
          <h1 className="text-3xl font-bold">Analytics Overview</h1>
          {loading && (
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin text-gray-400 ml-2"
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
