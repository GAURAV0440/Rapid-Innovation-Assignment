import { useEffect, useState } from "react";
import api from "../lib/axios";

type Img = { url: string; meta?: any };
type ImageResponse = {
  id: number | string;
  prompt: string;
  images: Img[];
  created_at?: string;
};

const fieldClass =
  "w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

export default function ImageGen() {
  const [prompt, setPrompt] = useState(() => localStorage.getItem("last_image_prompt") || "");
  const [images, setImages] = useState<Img[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("last_image_results") || "[]");
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(() => localStorage.getItem("last_image_saved") === "1");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (images.length > 0 && localStorage.getItem("last_image_saved") == null) {
      localStorage.setItem("last_image_saved", "0");
      setSaved(false);
    }
  }, []);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    localStorage.setItem("last_image_saved", "0");
    try {
      const { data } = await api.post<ImageResponse>("/image", { prompt });
      const imgs = Array.isArray(data?.images) ? data.images : [];
      setImages(imgs);
      localStorage.setItem("last_image_results", JSON.stringify(imgs));
      localStorage.setItem("last_image_prompt", prompt);
    } catch (e: any) {
      setError(e?.message || "Image generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!images.length) return;
    setSaving(true);
    setError(null);
    try {
      await api.post("/dashboard", {
        type: "image",
        prompt,
        images,
      });
      setSaved(true);
      localStorage.setItem("last_image_saved", "1");
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // ✅ NEW: Clear only this page's state (keeps Dashboard entries intact)
  function handleClear() {
    setImages([]);
    setSaved(false);
    setError(null);
    localStorage.removeItem("last_image_results");
    localStorage.setItem("last_image_saved", "0");
    setPrompt("");
    localStorage.removeItem("last_image_prompt");
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Image Generator</h1>

      <div className="flex gap-2 items-start">
        <textarea
          className={fieldClass}
          rows={3}
          placeholder="Describe the image you want to generate…"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            localStorage.setItem("last_image_prompt", e.target.value);
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold">Images for: {prompt}</h2>
            <div className="flex gap-2">
              {/* ✅ NEW Clear button */}
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

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt={`Generated ${i + 1}`}
                className="rounded border border-gray-200 dark:border-gray-800 w-full"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}