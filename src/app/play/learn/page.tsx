"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { StepLearner } from "@/components/player";
import { useSongStore } from "@/stores/songStore";
import { parseMidiFile, ParsedSong } from "@/lib/midi/parser";

export default function PlayLearnPage() {
  const router = useRouter();
  const { song, setSong } = useSongStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file.name.match(/\.(mid|midi)$/i)) {
        setError("Please upload a valid MIDI file (.mid or .midi)");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const parsed = await parseMidiFile(file);
        setSong(parsed);
        setCompleted(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to parse MIDI file"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setSong]
  );

  // Handle drag and drop
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleComplete = () => {
    setCompleted(true);
  };

  // If no song loaded, show upload interface
  if (!song) {
    return (
      <main className="min-h-[calc(100vh-4rem)] p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href="/play"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <span>←</span> Back to Play Songs
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Learn a Song</h1>
            <p className="text-gray-400">
              Upload a MIDI file to start learning
            </p>
          </div>

          {/* Upload area */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
              dragActive
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-gray-700 hover:border-gray-600"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mid,.midi"
              onChange={handleInputChange}
              className="hidden"
            />

            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400">Parsing MIDI file...</p>
              </div>
            ) : (
              <>
                <div className="text-6xl mb-4">🎹</div>
                <h2 className="text-xl font-bold mb-2">Drop MIDI File Here</h2>
                <p className="text-gray-400 mb-6">
                  or click the button below to browse
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
                >
                  Choose File
                </button>
              </>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Song is loaded - show learning interface
  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/play"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{song.name}</h1>
              <p className="text-gray-400 text-sm">
                {song.tempo} BPM • {song.timeSignature[0]}/{song.timeSignature[1]} •
                {song.tracks.left.length} left hand notes •
                {song.tracks.right.length} right hand notes
              </p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            Load Different Song
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mid,.midi"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>

        {/* Completion message */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl text-center"
            >
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">
                Congratulations!
              </h2>
              <p className="text-gray-300 mb-4">
                You&apos;ve completed learning this piece!
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    useSongStore.getState().reset();
                    setCompleted(false);
                  }}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                >
                  Practice Again
                </button>
                <Link
                  href="/play"
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  Choose Another Song
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step learner */}
        <StepLearner onComplete={handleComplete} />
      </div>
    </main>
  );
}
