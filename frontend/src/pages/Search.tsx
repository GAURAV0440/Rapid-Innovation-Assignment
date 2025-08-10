import { useEffect, useState } from "react";
import api from "../lib/axios";

type SearchItem = { title?: string; url?: string; summary?: string };
type SearchResponse = {
  id: number | string;
  query: string;
  results: SearchItem[];
  created_at?: string;
};

const fieldClass =
  "w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

export default function Search() {
  const [query, setQuery] = useState(() => localStorage.getItem("last_search_query") || "");
  const [results, setResults] = useState<SearchItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("last_search_results") || "[]");
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(() => localStorage.getItem("last_search_saved") === "1");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // normalize saved flag when results exist but saved flag is missing
    if (results.length > 0 && localStorage.getItem("last_search_saved") == null) {
      localStorage.setItem("last_search_saved", "0");
      setSaved(false);
    }
  }, []);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    localStorage.setItem("last_search_saved", "0");
    try {
      const { data } = await api.post<SearchResponse>("/search", { query });
      const items = Array.isArray(data?.results) ? data.results : [];
      setResults(items);
      localStorage.setItem("last_search_results", JSON.stringify(items));
      localStorage.setItem("last_search_query", query);
    } catch (e: any) {
      setError(e?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!results.length || !query.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.post("/dashboard", {
        type: "search",
        query,
        results,
      });
      setSaved(true);
      localStorage.setItem("last_search_saved", "1");
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // ✅ NEW: Clear only this page's state (keeps Dashboard data intact)
  function handleClear() {
    setResults([]);
    setSaved(false);
    setError(null);
    localStorage.removeItem("last_search_results");
    localStorage.setItem("last_search_saved", "0");
    setQuery("");
    localStorage.removeItem("last_search_query");
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Search</h1>

      <div className="flex gap-2">
        <input
          className={fieldClass}
          placeholder="Enter your query…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            localStorage.setItem("last_search_query", e.target.value);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold">Results for: {query}</h2>
            <div className="flex gap-2">
              {/* ✅ NEW clear button */}
              <button
                onClick={handleClear}
                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Clear
              </button>
              {/* existing Save button (unchanged) */}
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
              >
                {saved ? "Saved" : saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {results.map((r, i) => (
              <div
                key={i}
                className="rounded-md border border-gray-200 dark:border-gray-800 p-4"
              >
                {r.title && <div className="font-semibold mb-1">{r.title}</div>}
                {r.summary && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    {r.summary}
                  </p>
                )}
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    {r.url}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}