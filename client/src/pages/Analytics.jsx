// src/pages/Analytics.jsx

import React, { useState, useEffect, useCallback } from "react";
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

// quick ranges for the date buttons
const QUICK_RANGES = [
  { label: "7 d", days: 7 },
  { label: "30 d", days: 30 },
  { label: "90 d", days: 90 },
];

// colors for your Pie slices
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1"];

// helper to shift date by N days ago, formatted YYYY‑MM‑DD
function shiftDate(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export default function Analytics() {
  // -- State --
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

  // fetch analytics from backend
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

  // CSV export helper
  const downloadCSV = (rows, filename, headers) => {
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

  const onExportOverview = () =>
    downloadCSV(
      Object.entries(stats).map(([metric, value]) => ({ metric, value })),
      `overview_${range.start}_to_${range.end}.csv`,
      ["metric", "value"]
    );
  const onExportVisitors = () =>
    downloadCSV(timeSeries, `visitors_${range.start}_to_${range.end}.csv`, [
      "date",
      "visitors",
    ]);

  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

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

        <div className="flex flex-wrap items-center space-x-2">
          {/* Quick Ranges */}
          {QUICK_RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() =>
                setRange({
                  start: shiftDate(r.days),
                  end: shiftDate(0),
                })
              }
              className={`px-3 py-1 rounded ${
                shiftDate(r.days) === range.start
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } transition text-sm`}
            >
              {r.label}
            </button>
          ))}

          {/* Custom Date Pickers */}
          <div className="flex items-center bg-gray-800 rounded px-3 py-2">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="text-gray-400 mr-2"
            />
            <input
              type="date"
              value={range.start}
              onChange={(e) =>
                setRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="bg-transparent text-gray-100 text-sm focus:outline-none"
            />
            <span className="mx-2 text-gray-500">→</span>
            <input
              type="date"
              value={range.end}
              onChange={(e) =>
                setRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="bg-transparent text-gray-100 text-sm focus:outline-none"
            />
          </div>

          {/* Refresh & Export */}
          <button
            onClick={fetchAnalytics}
            className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition"
            title="Refresh"
          >
            <FontAwesomeIcon icon={faSyncAlt} className="text-gray-300" />
          </button>
          <button
            onClick={onExportOverview}
            className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition"
            title="Download Overview CSV"
          >
            <FontAwesomeIcon icon={faDownload} className="text-gray-300" />
          </button>
          <button
            onClick={onExportVisitors}
            className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition"
            title="Download Visitors CSV"
          >
            <FontAwesomeIcon icon={faFileAlt} className="text-gray-300" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading || !stats
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-700 rounded-lg animate-pulse"
              />
            ))
          : Object.entries(stats).map(([key, val]) => {
              let icon = faChartLine;
              if (/Users/i.test(key)) icon = faUsers;
              if (/Views|Pages/i.test(key)) icon = faFileAlt;
              if (/Visits|Sessions/i.test(key)) icon = faShareAlt;
              return (
                <div
                  key={key}
                  className="bg-gray-800 p-4 rounded-lg flex items-center space-x-4 hover:shadow-lg transition"
                  title={key.replace(/([A-Z])/g, " $1")}
                >
                  <FontAwesomeIcon
                    icon={icon}
                    className="text-purple-400 text-xl"
                  />
                  <div>
                    <p className="text-gray-400 text-sm">
                      {key.replace(/([A-Z])/g, " $1")}
                    </p>
                    <p className="text-white text-2xl font-semibold">{val}</p>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visitors Over Time */}
        <div className="bg-gray-800 p-4 rounded-lg min-h-[220px]">
          <h2 className="text-lg font-semibold mb-2 text-white">
            Visitors Over Time
          </h2>
          {loading ? (
            <div className="h-40 bg-gray-700 animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeSeries}>
                <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 12 }} />
                <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                <ReTooltip
                  contentStyle={{ backgroundColor: "#2a2a2a", border: "none" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Pages */}
        <div className="bg-gray-800 p-4 rounded-lg min-h-[220px]">
          <h2 className="text-lg font-semibold mb-2 text-white">Top Pages</h2>
          {loading ? (
            <div className="h-40 bg-gray-700 animate-pulse rounded" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pagesData}>
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
                <Bar dataKey="views" fill="#8884d8" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Traffic Sources (custom legend with paths) */}
        <div className="bg-gray-800 p-4 rounded-lg min-h-[220px]">
          <h2 className="text-lg font-semibold mb-2 text-white">
            Traffic Sources
          </h2>
          {loading ? (
            <div className="h-40 bg-gray-700 animate-pulse rounded" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sourcesData}
                    dataKey="value"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={false}
                    labelLine={false}
                  >
                    {sourcesData.map((item, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
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
                    contentStyle={{
                      backgroundColor: "#2a2a2a",
                      border: "none",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* custom legend */}
              <div className="mt-4 flex flex-wrap">
                {sourcesData.map((item, idx) => {
                  let path;
                  try {
                    path = new URL(item.source).pathname;
                  } catch {
                    path = item.source;
                  }
                  return (
                    <div
                      key={path + idx}
                      className="flex items-center mr-6 mb-2"
                    >
                      <span
                        className="w-3 h-3 inline-block mr-2 rounded-sm"
                        style={{
                          backgroundColor: COLORS[idx % COLORS.length],
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
      </div>
    </div>
  );
}
