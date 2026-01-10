"use client";

import { useState, useRef, useEffect } from "react";
import { SheetMusicEditor } from "@/components/composer";
import { useComposerStore, SheetNote } from "@/stores/composerStore";

export default function ComposePage() {
  const {
    notes,
    clearNotes,
    loadNotes,
    setTimeSignature,
    setKeySignature,
    setTempo,
    setMeasures,
  } = useComposerStore();
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem("claude-api-key");
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  // Save API key to localStorage when changed
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem("claude-api-key", key);
    } else {
      localStorage.removeItem("claude-api-key");
    }
  };

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
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setPdfFile(file);
        setError(null);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleTranscribe = async () => {
    if (!pdfFile) return;

    if (!apiKey) {
      setShowApiKeyInput(true);
      setError("Please enter your Claude API key to transcribe sheet music.");
      return;
    }

    setIsTranscribing(true);
    setError(null);
    setTranscriptionResult(null);

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "x-anthropic-key": apiKey,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to transcribe");
      }

      // Update composer state with transcribed data
      if (data.timeSignature) {
        setTimeSignature(data.timeSignature);
      }
      if (data.keySignature !== undefined) {
        setKeySignature(data.keySignature);
      }
      if (data.tempo) {
        setTempo(data.tempo);
      }

      // Calculate how many measures we need
      if (data.notes && data.notes.length > 0) {
        const maxMeasure = Math.max(...data.notes.map((n: SheetNote) => n.measure));
        setMeasures(Math.max(4, maxMeasure + 2));

        // Convert API notes to SheetNote format with IDs
        const notesWithIds: SheetNote[] = data.notes.map((n: Omit<SheetNote, "id">, i: number) => ({
          ...n,
          id: `transcribed-${i}`,
        }));

        loadNotes(notesWithIds);
      }

      setTranscriptionResult(
        `Successfully transcribed "${data.title || pdfFile.name}"! Found ${data.notes?.length || 0} notes.`
      );
      setPdfFile(null);
    } catch (err) {
      console.error("Failed to transcribe PDF:", err);
      setError(err instanceof Error ? err.message : "Failed to transcribe PDF. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Compose</h1>
            <p className="text-gray-400">
              Create your own sheet music or transcribe from PDF
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowPdfUpload(!showPdfUpload)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                showPdfUpload
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              <span className="mr-2">📄</span>
              Import PDF
            </button>

            {notes.length > 0 && (
              <button
                onClick={clearNotes}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* PDF Upload Panel */}
        {showPdfUpload && (
          <div className="mb-8 bg-purple-900/20 border border-purple-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🤖</span> AI Sheet Music Transcription
            </h2>
            <p className="text-gray-400 mb-6">
              Upload a PDF of sheet music and Claude AI will transcribe it into editable notation.
            </p>

            {/* API Key Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-300">Claude API Key</label>
                <button
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  {showApiKeyInput ? "Hide" : apiKey ? "Change" : "Add Key"}
                </button>
              </div>

              {showApiKeyInput && (
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              )}

              {apiKey && !showApiKeyInput && (
                <p className="text-sm text-green-400">API key configured</p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Success message */}
            {transcriptionResult && (
              <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg text-green-300 text-sm">
                {transcriptionResult}
              </div>
            )}

            {!pdfFile ? (
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-600 hover:border-gray-500"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleChange}
                  className="hidden"
                />

                <div className="text-4xl mb-3">📄</div>
                <p className="text-gray-300 mb-4">
                  Drag and drop a PDF here, or click to browse
                </p>

                <button
                  onClick={() => inputRef.current?.click()}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                >
                  Choose PDF
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">📄</span>
                  <div>
                    <h3 className="font-bold">{pdfFile.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {(pdfFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPdfFile(null);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                  >
                    Remove
                  </button>
                  <button
                    onClick={handleTranscribe}
                    disabled={isTranscribing}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {isTranscribing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Transcribing...
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        Transcribe with AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <p className="text-gray-500 text-sm mt-4">
              Note: AI transcription works best with clear, high-quality PDFs of printed sheet music.
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>
        )}

        {/* Sheet Music Editor */}
        <SheetMusicEditor />

        {/* Instructions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <span>🖱️</span> Click to Add Notes
            </h4>
            <p className="text-gray-400 text-sm">
              Click anywhere on the staff to add a note. The note will be placed
              at the closest line or space.
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <span>🗑️</span> Click Notes to Remove
            </h4>
            <p className="text-gray-400 text-sm">
              Click on any existing note to remove it from the score.
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <span>▶️</span> Play Your Composition
            </h4>
            <p className="text-gray-400 text-sm">
              Use the play button to hear your composition. The playback will
              highlight each note as it plays.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
