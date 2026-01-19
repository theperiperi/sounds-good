"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { parseMidiFile } from "@/lib/midi/parser";
import { useSongStore } from "@/stores/songStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Music,
  Upload,
  FileMusic,
  Hand,
  Fingerprint,
  BarChart3,
  Piano,
  Loader2
} from "lucide-react";

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
          <Badge variant="outline" className="mb-4 border-gold/30 text-gold">
            <Music className="w-3 h-3 mr-1" />
            Song Learning
          </Badge>
          <h1 className="font-serif text-5xl font-bold mb-4 text-shadow-gold">Play Songs</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload a MIDI file to get a step-by-step tutorial with fingering suggestions.
            Learn songs at your own pace.
          </p>
        </div>

        {/* Upload area */}
        <Card
          className={`border-2 border-dashed transition-all ${
            dragActive
              ? "border-gold bg-gold/10"
              : "border-border hover:border-gold/30 bg-card/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="p-12 text-center">
            <input
              ref={inputRef}
              type="file"
              accept=".mid,.midi"
              onChange={handleChange}
              className="hidden"
            />

            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center">
              <FileMusic className="w-10 h-10 text-gold" />
            </div>
            <h2 className="font-serif text-xl font-bold mb-2">Upload MIDI File</h2>
            <p className="text-muted-foreground mb-6">
              Drag and drop a .mid or .midi file here, or click to browse
            </p>

            <Button
              onClick={() => inputRef.current?.click()}
              className="gradient-gold text-black hover:opacity-90"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </CardContent>
        </Card>

        {/* Uploaded file preview */}
        {uploadedFile && (
          <Card className="mt-8 bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <FileMusic className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold">{uploadedFile.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleStartLearning}
                  disabled={isLoading}
                  className="gradient-gold text-black hover:opacity-90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Start Learning"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <Hand className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-bold mb-2">Hands Separate</h3>
              <p className="text-muted-foreground text-sm">
                Learn right hand, left hand, or both together
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <Fingerprint className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-bold mb-2">Fingering Suggestions</h3>
              <p className="text-muted-foreground text-sm">
                Get recommended finger numbers for each note
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-bold mb-2">Progress Tracking</h3>
              <p className="text-muted-foreground text-sm">
                See your accuracy and timing scores
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sample songs */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl font-bold mb-6">Sample Songs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Twinkle Twinkle Little Star", difficulty: "Beginner", duration: "0:45" },
              { title: "Fur Elise (Simplified)", difficulty: "Beginner", duration: "1:30" },
              { title: "Prelude in C Major (Bach)", difficulty: "Intermediate", duration: "2:15" },
              { title: "Clair de Lune (Excerpt)", difficulty: "Advanced", duration: "3:00" },
            ].map((song, i) => (
              <Card
                key={i}
                className="bg-card/50 border-border hover:border-gold/30 transition-all cursor-pointer"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Piano className="w-5 h-5 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{song.title}</h3>
                    <p className="text-muted-foreground text-sm">{song.difficulty}</p>
                  </div>
                  <span className="text-muted-foreground text-sm">{song.duration}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-muted-foreground text-sm mt-4">
            Sample songs coming soon
          </p>
        </div>
      </div>
    </main>
  );
}
