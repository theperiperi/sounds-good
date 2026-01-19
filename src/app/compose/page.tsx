"use client";

import { useState, useRef, useEffect } from "react";
import { SheetMusicEditor } from "@/components/composer";
import { useComposerStore, SheetNote } from "@/stores/composerStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PenTool,
  FileUp,
  Trash2,
  FileText,
  Key,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  MousePointer,
  MousePointerClick,
  Play
} from "lucide-react";

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

  useEffect(() => {
    const storedKey = localStorage.getItem("claude-api-key");
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

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

      if (data.timeSignature) {
        setTimeSignature(data.timeSignature);
      }
      if (data.keySignature !== undefined) {
        setKeySignature(data.keySignature);
      }
      if (data.tempo) {
        setTempo(data.tempo);
      }

      if (data.notes && data.notes.length > 0) {
        const maxMeasure = Math.max(...data.notes.map((n: SheetNote) => n.measure));
        setMeasures(Math.max(4, maxMeasure + 2));

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
            <Badge variant="outline" className="mb-3 border-gold/30 text-gold">
              <PenTool className="w-3 h-3 mr-1" />
              Sheet Music Editor
            </Badge>
            <h1 className="font-serif text-4xl font-bold text-shadow-gold">Compose</h1>
            <p className="text-muted-foreground mt-1">
              Create your own sheet music or transcribe from PDF
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant={showPdfUpload ? "default" : "secondary"}
              onClick={() => setShowPdfUpload(!showPdfUpload)}
              className={showPdfUpload ? "gradient-gold text-black" : ""}
            >
              <FileUp className="w-4 h-4 mr-2" />
              Import PDF
            </Button>

            {notes.length > 0 && (
              <Button variant="secondary" onClick={clearNotes}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* PDF Upload Panel */}
        {showPdfUpload && (
          <Card className="mb-8 bg-gradient-to-r from-gold/10 to-gold-dark/10 border-gold/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                AI Sheet Music Transcription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Upload a PDF of sheet music and Claude AI will transcribe it into editable notation.
              </p>

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-muted-foreground">Claude API Key</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    className="text-gold hover:text-gold/80"
                  >
                    <Key className="w-3 h-3 mr-1" />
                    {showApiKeyInput ? "Hide" : apiKey ? "Change" : "Add Key"}
                  </Button>
                </div>

                {showApiKeyInput && (
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="sk-ant-api03-..."
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold"
                  />
                )}

                {apiKey && !showApiKeyInput && (
                  <p className="text-sm text-gold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    API key configured
                  </p>
                )}
              </div>

              {/* Error message */}
              {error && (
                <Card className="bg-destructive/20 border-destructive/50">
                  <CardContent className="p-3 flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </CardContent>
                </Card>
              )}

              {/* Success message */}
              {transcriptionResult && (
                <Card className="bg-gold/10 border-gold/30">
                  <CardContent className="p-3 flex items-center gap-2 text-gold text-sm">
                    <Check className="w-4 h-4" />
                    {transcriptionResult}
                  </CardContent>
                </Card>
              )}

              {!pdfFile ? (
                <Card
                  className={`border-2 border-dashed transition-all ${
                    dragActive
                      ? "border-gold bg-gold/10"
                      : "border-border hover:border-gold/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <CardContent className="p-8 text-center">
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleChange}
                      className="hidden"
                    />

                    <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Drag and drop a PDF here, or click to browse
                    </p>

                    <Button
                      onClick={() => inputRef.current?.click()}
                      className="gradient-gold text-black hover:opacity-90"
                    >
                      Choose PDF
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-secondary/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-bold">{pdfFile.name}</h3>
                        <p className="text-muted-foreground text-sm">
                          {(pdfFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setPdfFile(null);
                          setError(null);
                        }}
                      >
                        Remove
                      </Button>
                      <Button
                        onClick={handleTranscribe}
                        disabled={isTranscribing}
                        className="gradient-gold text-black hover:opacity-90"
                      >
                        {isTranscribing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Transcribing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Transcribe with AI
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <p className="text-muted-foreground text-sm">
                Note: AI transcription works best with clear, high-quality PDFs of printed sheet music.
                Your API key is stored locally and never sent to our servers.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sheet Music Editor */}
        <SheetMusicEditor />

        {/* Instructions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <MousePointer className="w-4 h-4 text-gold" />
                </div>
                <h4 className="font-bold">Click to Add Notes</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Click anywhere on the staff to add a note. The note will be placed
                at the closest line or space.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <MousePointerClick className="w-4 h-4 text-gold" />
                </div>
                <h4 className="font-bold">Click Notes to Remove</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Click on any existing note to remove it from the score.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Play className="w-4 h-4 text-gold" />
                </div>
                <h4 className="font-bold">Play Your Composition</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Use the play button to hear your composition. The playback will
                highlight each note as it plays.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
