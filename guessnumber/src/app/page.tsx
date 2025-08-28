"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2 } from "lucide-react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{
    verdict: string;
    description: string;
    fullResponse: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze image");

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a1c2c] via-[#2e1f47] to-[#5c1f4a] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="backdrop-blur-2xl bg-white/10 rounded-3xl shadow-2xl p-10 w-full max-w-xl border border-white/20"
      >
        {/* Title */}
        <h1 className="text-5xl font-extrabold text-center text-white drop-shadow-lg mb-10 tracking-tight">
          HOT or NOT
        </h1>

        {/* Upload Box */}
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center border-2 border-dashed border-white/40 rounded-2xl p-10 text-center hover:border-white/70 hover:bg-white/5 transition cursor-pointer"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <Upload className="mx-auto h-14 w-14 text-white/80 mb-4" />
          <p className="text-xl font-semibold text-white">Upload an Image</p>
          <p className="text-sm text-white/60 mt-1">PNG, JPG, or GIF (Max 10MB)</p>
        </label>

        {/* Preview */}
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-8 text-center"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-72 object-cover rounded-2xl shadow-lg border border-white/30"
            />
            <p className="text-sm text-white/70 mt-3">{selectedFile?.name}</p>
          </motion.div>
        )}

        {/* Analyze Button */}
        {selectedFile && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg tracking-wide transition-all duration-300 transform hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" /> Analyzing...
              </>
            ) : (
              <>🔥 Analyze Image 🔥</>
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-400 text-red-200 px-5 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-10 text-center"
          >
            <div
              className={`text-6xl font-extrabold mb-6 drop-shadow-lg tracking-wide ${
                result.verdict === "HOT" ? "text-yellow-300" : "text-gray-300"
              }`}
            >
              {result.verdict === "HOT" ? "🔥 HOT 🔥" : "❌ NOT ❌"}
            </div>
            <p className="text-xl font-medium text-white/90 mb-5">
              {result.description}
            </p>
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 text-left">
              <p className="text-sm text-white/70 mb-2">Full AI Response:</p>
              <p className="font-medium text-white text-sm whitespace-pre-wrap leading-relaxed">
                {result.fullResponse}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
