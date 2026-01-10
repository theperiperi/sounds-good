"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { parseMidiFile } from "@/lib/midi/parser";
import { useSongStore } from "@/stores/songStore";

export default function PlayPage() {
  const router = useRouter();
  const { setSong } = useSongStore();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".mid") || file.name.endsWith(".midi")) {
        setUploadedFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleStartLearning = useCallback(async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    try {
      const parsed = await parseMidiFile(uploadedFile);
      setSong(parsed);
      router.push("/play/learn");
    } catch (error) {
      console.error("Failed to parse MIDI:", error);
      alert("Failed to parse MIDI file. Please try another file.");
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFile, setSong, router]);

  return (
    <main className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Play Songs</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload a MIDI file to get a step-by-step tutorial with fingering suggestions.
            Learn songs at your own pace.
          </p>
        </div>

        {/* Upload area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
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
            ref={inputRef}
            type="file"
            accept=".mid,.midi"
            onChange={handleChange}
            className="hidden"
          />

          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-xl font-bold mb-2">Upload MIDI File</h2>
          <p className="text-gray-400 mb-6">
            Drag and drop a .mid or .midi file here, or click to browse
          </p>

          <button
            onClick={() => inputRef.current?.click()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
          >
            Choose File
          </button>
        </div>

        {/* Uploaded file preview */}
        {uploadedFile && (
          <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">📄</span>
                <div>
                  <h3 className="font-bold">{uploadedFile.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <button
                onClick={handleStartLearning}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Start Learning →"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <span className="text-3xl mb-4 block">✋</span>
            <h3 className="font-bold mb-2">Hands Separate</h3>
            <p className="text-gray-400 text-sm">
              Learn right hand, left hand, or both together
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <span className="text-3xl mb-4 block">🖐️</span>
            <h3 className="font-bold mb-2">Fingering Suggestions</h3>
            <p className="text-gray-400 text-sm">
              Get recommended finger numbers for each note
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <span className="text-3xl mb-4 block">📊</span>
            <h3 className="font-bold mb-2">Progress Tracking</h3>
            <p className="text-gray-400 text-sm">
              See your accuracy and timing scores
            </p>
          </div>
        </div>

        {/* Sample songs */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Sample Songs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Twinkle Twinkle Little Star", difficulty: "Beginner", duration: "0:45" },
              { title: "Für Elise (Simplified)", difficulty: "Beginner", duration: "1:30" },
              { title: "Prelude in C Major (Bach)", difficulty: "Intermediate", duration: "2:15" },
              { title: "Clair de Lune (Excerpt)", difficulty: "Advanced", duration: "3:00" },
            ].map((song, i) => (
              <button
                key={i}
                className="flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 transition-colors text-left"
              >
                <span className="text-2xl">🎹</span>
                <div className="flex-1">
                  <h3 className="font-medium">{song.title}</h3>
                  <p className="text-gray-400 text-sm">{song.difficulty}</p>
                </div>
                <span className="text-gray-500 text-sm">{song.duration}</span>
              </button>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-4">
            Sample songs coming soon
          </p>
        </div>
      </div>
    </main>
  );
}
