import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/axios";

type SearchItem = { title?: string; url?: string; summary?: string };
type Detail =
  | { type: "search"; id: number; query: string; results: SearchItem[]; title: string }
  | { type: "image"; id: number; prompt: string; images: { url: string }[]; title: string };

export default function EntryDetail() {
  const { id, type } = useParams<{ id: string; type: "search" | "image" }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || (type !== "search" && type !== "image")) {
      setError("Invalid URL");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get(`/dashboard/${id}`, { params: { type } });
        if (!data?.type) throw new Error("Not found");
        setDetail(data as Detail);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, type]);

  if (loading) {
    return <div className="max-w-3xl mx-auto p-4">Loading…</div>;
  }
  if (error || !detail) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="mb-4 text-red-600">Error: {error || "Not found"}</div>
        <button className="btn" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{detail.title}</h1>
        <Link className="btn btn-ghost" to="/dashboard">Back to Dashboard</Link>
      </div>

      {detail.type === "search" ? (
        <div className="space-y-4">
          <div className="text-sm opacity-80 mb-2">Query: <span className="font-medium">{detail.query}</span></div>
          {detail.results?.length ? (
            detail.results.map((r, i) => (
              <div key={i} className="border border-base-300 rounded p-4">
                {r.title && <div className="font-semibold mb-1">{r.title}</div>}
                {r.summary && <p className="text-sm opacity-80 mb-1">{r.summary}</p>}
                {r.url && (
                  <a className="link link-primary text-sm" target="_blank" rel="noreferrer" href={r.url}>
                    {r.url}
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="opacity-70">No results stored for this query.</div>
          )}
        </div>
      ) : (
        <div>
          <div className="text-sm opacity-80 mb-2">Prompt: <span className="font-medium">{detail.prompt}</span></div>
          {detail.images?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {detail.images.map((img, i) => (
                <img key={i} src={img.url} alt={`Saved ${i + 1}`} className="rounded border border-base-300" />
              ))}
            </div>
          ) : (
            <div className="opacity-70">No images stored for this prompt.</div>
          )}
        </div>
      )}
    </div>
  );
}
