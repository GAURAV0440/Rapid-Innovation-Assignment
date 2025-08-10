import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/axios";

type Item = {
  id: number;
  type: "search" | "image";
  title: string;
  snippet?: string | null;
  image_url?: string | null;
  created_at: string;
};

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("type") as "all" | "search" | "image") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  function setTab(next: "all" | "search" | "image") {
    setSearchParams({ type: next, page: "1" });
  }

  async function fetchItems() {
    setLoading(true);
    try {
      const { data } = await api.get("/dashboard", { params: { type: tab, page } });
      setItems(data?.items || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(it: Item) {
    await api.delete(`/dashboard/${it.id}`, { params: { type: it.type } });
    fetchItems();
  }

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <div className="mb-4 flex gap-2">
        <button className={`btn btn-sm ${tab === "all" ? "btn-primary" : ""}`} onClick={() => setTab("all")}>All</button>
        <button className={`btn btn-sm ${tab === "search" ? "btn-primary" : ""}`} onClick={() => setTab("search")}>Search</button>
        <button className={`btn btn-sm ${tab === "image" ? "btn-primary" : ""}`} onClick={() => setTab("image")}>Image</button>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <div className="opacity-70">No entries found.</div>
      ) : (
        <div className="space-y-4">
          {items.map((it) => (
            <div key={`${it.type}-${it.id}`} className="rounded border border-base-300 p-4">
              <div className="flex items-center justify-between mb-2">
                {/* 🔗 Title links to the detail view */}
                <Link
                  to={`/dashboard/${it.type}/${it.id}`}
                  className="font-semibold hover:underline"
                >
                  {it.type === "search" ? `Search  ${it.title}` : `Image  ${it.title}`}
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(it)}>
                  Delete
                </button>
              </div>

              {it.type === "search" ? (
                <div className="text-sm opacity-80">{it.snippet || "Summary"}</div>
              ) : (
                <div>
                  {it.image_url ? (
                    <Link to={`/dashboard/${it.type}/${it.id}`}>
                      <img src={it.image_url} alt="thumb" className="rounded border border-base-300 max-w-md" />
                    </Link>
                  ) : (
                    <div className="opacity-70 text-sm">No thumbnail saved</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
