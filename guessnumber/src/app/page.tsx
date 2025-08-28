"use client";

import { useState, useEffect } from "react";
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [sparkles, setSparkles] = useState<{ x: number; y: number }[]>([]);

  // Track mouse movement for interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate sparkles only on client
  useEffect(() => {
    const s = Array.from({ length: 30 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    }));
    setSparkles(s);
  }, []);

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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1a1c2c] via-[#2e1f47] to-[#5c1f4a] flex items-center justify-center p-6">
      {/* Animated background glow following mouse */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-pink-500/20 blur-3xl"
        style={{
          left: mousePos.x - 300,
          top: mousePos.y - 300,
        }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {sparkles.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-pink-400 rounded-full shadow"
            initial={{ x: pos.x, y: pos.y, opacity: 0 }}
            animate={{ y: [pos.y, pos.y - 200], opacity: [0, 1, 0] }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 backdrop-blur-2xl bg-white/10 rounded-3xl shadow-2xl p-10 w-full max-w-xl border border-white/20"
      >
        {/* Title */}
        <h1 className="text-5xl font-extrabold text-center text-white drop-shadow-lg mb-10 tracking-tight">
          HOT or NOT
        </h1>

        {/* Upload Box */}
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center border-2 border-dashed border-white/40 rounded-2xl p-10 text-center hover:border-white/70 hover:bg-white/5 transition cursor-pointer group"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <Upload className="mx-auto h-14 w-14 text-white/80 mb-4 group-hover:scale-110 transition-transform" />
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
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={preview}
              alt="Preview"
              className="w-full h-72 object-cover rounded-2xl shadow-lg border border-white/30"
            />
            <p className="text-sm text-white/70 mt-3">{selectedFile?.name}</p>
          </motion.div>
        )}

        {/* Analyze Button */}
        {selectedFile && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg tracking-wide transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" /> Analyzing...
              </>
            ) : (
              <>🔥 Analyze Image 🔥</>
            )}
          </motion.button>
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
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`text-6xl font-extrabold mb-6 drop-shadow-lg tracking-wide ${
                result.verdict === "HOT" ? "text-yellow-300" : "text-gray-300"
              }`}
            >
              {result.verdict === "HOT" ? "🔥 HOT 🔥" : "❌ NOT ❌"}
            </motion.div>
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
