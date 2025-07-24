import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api";
import Select from "react-select";
import { getCodeList } from "country-list";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSyncAlt,
  faSortAmountDown,
  faSortAmountUp,
  faSearch,
  faThLarge,
  faList,
  faBookmark as faBookmarkSolid,
  faShareAlt,
  faCopy,
  faTimes,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faBookmark as faRegBookmark } from "@fortawesome/free-regular-svg-icons";

// tiny helper to format relative time
function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// convert country code to emoji flag
function flagEmoji(code) {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

export default function TechTrends() {
  const categories = [
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology",
  ];

  // build country options once
  const countryOptions = useMemo(() => {
    const codes = getCodeList(); // { "KE": "Kenya", ... }
    return Object.entries(codes)
      .map(([code, name]) => ({
        value: code.toLowerCase(),
        label: `${flagEmoji(code)}  ${name}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  // state
  const [cat, setCat] = useState(categories[0]);
  const [country, setCountry] = useState(
    countryOptions.find((o) => o.value === "ke")
  );
  const [trends, setTrends] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tt_favorites")) || [];
    } catch {
      return [];
    }
  });
  const [showFavs, setShowFavs] = useState(false);
  const [modalTrend, setModalTrend] = useState(null);

  // fetch data
  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/trends", {
        params: { cat, country: country.value },
      });
      setTrends(data);
      setPage(1);
    } catch (err) {
      console.error("Error fetching trends:", err);
      setError(
        err.response?.status === 404
          ? "No trends found for that category."
          : "Failed to load trends."
      );
    } finally {
      setLoading(false);
    }
  }, [cat, country]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  // filter, sort, favorites
  useEffect(() => {
    let arr = trends.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );
    if (showFavs) arr = arr.filter((t) => favorites.includes(t.id));
    arr.sort((a, b) =>
      sortAsc
        ? new Date(a.published) - new Date(b.published)
        : new Date(b.published) - new Date(a.published)
    );
    setFiltered(arr);
    setPage(1);
  }, [trends, search, sortAsc, showFavs, favorites]);

  // persist favorites
  useEffect(() => {
    localStorage.setItem("tt_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleFav = (id) =>
    setFavorites((f) =>
      f.includes(id) ? f.filter((x) => x !== id) : [...f, id]
    );
  const openModal = (t) => setModalTrend(t);
  const closeModal = () => setModalTrend(null);
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };
  const shareTrend = (t) => {
    if (navigator.share) {
      navigator.share({ title: t.title, text: t.summary, url: t.url });
    } else {
      copyToClipboard(`${t.title}\n\n${t.summary}\n${t.url}`);
    }
  };

  // react-select styles for dark theme
  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "#1f2937",
      borderColor: "#374151",
    }),
    menu: (base) => ({ ...base, backgroundColor: "#1f2937" }),
    singleValue: (base) => ({ ...base, color: "#f9fafb" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#374151" : "#1f2937",
      color: "#f9fafb",
    }),
    placeholder: (base) => ({ ...base, color: "#9ca3af" }),
  };

  return (
    <div className="space-y-6">
      {/* Header + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center">
          Tech Trends
          {loading && (
            <FontAwesomeIcon
              icon={faSpinner}
              className="ml-3 animate-spin text-gray-400"
            />
          )}
        </h1>
        <div className="flex flex-wrap items-center space-x-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCat(c);
                setSearch("");
                setShowFavs(false);
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                c === cat
                  ? "bg-purple-400 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
          <div className="w-48">
            <Select
              options={countryOptions}
              value={country}
              onChange={setCountry}
              styles={selectStyles}
              isSearchable
              placeholder="Select country..."
            />
          </div>
          <button
            onClick={() => setShowFavs((f) => !f)}
            className="p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
            title="Show Favorites"
          >
            <FontAwesomeIcon
              icon={faBookmarkSolid}
              className={showFavs ? "text-yellow-300" : "text-gray-300"}
            />
          </button>
          <button
            onClick={fetchTrends}
            className="p-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
            title="Refresh"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>
      </div>

      {/* Search / Sort / View */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search trends…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-gray-100 rounded focus:ring-purple-500 focus:ring-2"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortAsc((s) => !s)}
            className="flex items-center space-x-1 px-3 py-2 bg-gray-800 text-gray-100 rounded hover:bg-gray-700 transition"
          >
            <FontAwesomeIcon
              icon={sortAsc ? faSortAmountUp : faSortAmountDown}
            />
            <span className="text-sm">
              {sortAsc ? "Oldest First" : "Newest First"}
            </span>
          </button>
          <button
            onClick={() => setViewMode((m) => (m === "grid" ? "list" : "grid"))}
            className="p-2 rounded bg-gray-800 text-gray-100 hover:bg-gray-700 transition"
            title="Toggle View"
          >
            <FontAwesomeIcon icon={viewMode === "grid" ? faList : faThLarge} />
          </button>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400">
          {showFavs ? "No favorites found." : "No trends found."}
        </p>
      ) : (
        <>
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {pageItems.map((t) => (
              <div
                key={t.id}
                className="bg-gray-800 rounded-lg p-6 flex flex-col justify-between hover:shadow-lg transition group"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    {/* category badge */}
                    <span className="px-2 py-0.5 bg-purple-600 text-xs rounded">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </span>
                    {/* clickable source name */}
                    {t.source && (
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:underline"
                      >
                        {t.source}
                      </a>
                    )}
                  </div>
                  <h3
                    className="text-xl font-semibold text-white cursor-pointer hover:underline"
                    onClick={() => openModal(t)}
                  >
                    {t.title}
                  </h3>
                  <p className="text-gray-400 line-clamp-3 mt-2">{t.summary}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-gray-400 text-sm">
                  <span>{timeAgo(t.published)}</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleFav(t.id)}
                      className="hover:text-yellow-300 transition"
                    >
                      <FontAwesomeIcon
                        icon={
                          favorites.includes(t.id)
                            ? faBookmarkSolid
                            : faRegBookmark
                        }
                      />
                    </button>
                    <button
                      onClick={() => copyToClipboard(t.summary)}
                      className="hover:text-blue-300 transition"
                      title="Copy summary"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                    <button
                      onClick={() => shareTrend(t)}
                      className="hover:text-green-300 transition"
                      title="Share"
                    >
                      <FontAwesomeIcon icon={faShareAlt} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition"
              >
                Prev
              </button>
              <span className="text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modalTrend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center">
          <div className="bg-gray-900 rounded-lg max-w-lg w-full p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">
              {modalTrend.title}
            </h2>
            <p className="text-gray-300 whitespace-pre-line">
              {modalTrend.summary}
            </p>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => copyToClipboard(modalTrend.summary)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition"
              >
                <FontAwesomeIcon icon={faCopy} />
                <span>Copy</span>
              </button>
              <button
                onClick={() => shareTrend(modalTrend)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded transition"
              >
                <FontAwesomeIcon icon={faShareAlt} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
