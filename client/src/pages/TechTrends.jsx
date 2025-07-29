
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
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
import ThemeContext from "../contexts/ThemeContext";

// Helpers
const categories = [
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology",
];

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function flagEmoji(code) {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

export default function TechTrends() {
  const { dark } = useContext(ThemeContext);

  // Country dropdown
  const countryOptions = useMemo(() => {
    const codes = getCodeList();
    return Object.entries(codes)
      .map(([code, name]) => ({
        value: code.toLowerCase(),
        label: `${flagEmoji(code)} ${name}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  // State
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

  // Fetch trends
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

  // Filter, sort, pagination
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

  useEffect(() => {
    localStorage.setItem("tt_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleFav = (id) =>
    setFavorites((f) =>
      f.includes(id) ? f.filter((x) => x !== id) : [...f, id]
    );
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

  // React-select dark styles
  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: dark ? "#374151" : "white",
      borderColor: dark ? "#4B5563" : "#D1D5DB",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: dark ? "#374151" : "white",
    }),
    singleValue: (base) => ({
      ...base,
      color: dark ? "white" : "black",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? dark
          ? "#4B5563"
          : "#F3F4F6"
        : dark
        ? "#374151"
        : "white",
      color: dark ? "white" : "black",
    }),
  };

  return (
    <div className="space-y-6">
      {/* Header + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="flex items-center text-3xl font-bold">
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
                  : dark
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {c[0].toUpperCase() + c.slice(1)}
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
            className={`p-2 rounded-full transition ${
              dark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title="Show Favorites"
          >
            <FontAwesomeIcon
              icon={faBookmarkSolid}
              className={showFavs ? "text-yellow-300" : ""}
            />
          </button>
          <button
            onClick={fetchTrends}
            className={`p-2 rounded-full transition ${
              dark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
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
            className={`w-full rounded pl-12 pr-3 py-2 focus:ring-2 focus:ring-purple-500 ${
              dark
                ? "bg-gray-700 text-white placeholder-gray-400"
                : "bg-gray-100 text-gray-900 placeholder-gray-600"
            }`}
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortAsc((s) => !s)}
            className={`flex items-center space-x-1 rounded px-3 py-2 transition ${
              dark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
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
            className={`p-2 rounded transition ${
              dark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
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
              className="h-32 animate-pulse rounded-lg bg-gray-700"
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
                className={`flex flex-col justify-between rounded-lg p-6 transition group ${
                  dark
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div>
                  <div className="mb-2 flex items-center space-x-2">
                    <span className="rounded bg-purple-600 px-2 py-0.5 text-xs text-white">
                      {cat[0].toUpperCase() + cat.slice(1)}
                    </span>
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
                    className="mb-2 cursor-pointer text-xl font-semibold hover:underline"
                    onClick={() => setModalTrend(t)}
                  >
                    {t.title}
                  </h3>
                  <p className="line-clamp-3 text-gray-400">{t.summary}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                  <span>{timeAgo(t.published)}</span>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => toggleFav(t.id)}>
                      <FontAwesomeIcon
                        icon={
                          favorites.includes(t.id)
                            ? faBookmarkSolid
                            : faRegBookmark
                        }
                        className={
                          favorites.includes(t.id) ? "text-yellow-300" : ""
                        }
                      />
                    </button>
                    <button onClick={() => copyToClipboard(t.summary)}>
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                    <button onClick={() => shareTrend(t)}>
                      <FontAwesomeIcon icon={faShareAlt} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center space-x-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded px-3 py-1 disabled:opacity-50 transition"
              >
                Prev
              </button>
              <span className="text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded px-3 py-1 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {modalTrend && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div
            className={`${
              dark ? "bg-gray-800" : "bg-white"
            } max-w-lg rounded-lg p-6`}
          >
            <button
              onClick={() => setModalTrend(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 className="mb-4 text-2xl font-bold">{modalTrend.title}</h2>
            <p className="whitespace-pre-line text-gray-400">
              {modalTrend.summary}
            </p>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => copyToClipboard(modalTrend.summary)}
                className="flex items-center space-x-2 rounded px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white transition"
              >
                <FontAwesomeIcon icon={faCopy} />
                <span>Copy</span>
              </button>
              <button
                onClick={() => shareTrend(modalTrend)}
                className="flex items-center space-x-2 rounded px-4 py-2 bg-green-600 hover:bg-green-500 text-white transition"
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
