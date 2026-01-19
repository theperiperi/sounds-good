"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { StepLearner } from "@/components/player";
import { useSongStore } from "@/stores/songStore";
import { parseMidiFile } from "@/lib/midi/parser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Upload,
  Piano,
  Loader2,
  PartyPopper,
  RotateCcw,
  Music
} from "lucide-react";

export default function PlayLearnPage() {
  const { song, setSong } = useSongStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (!song) {
    return (
      <main className="min-h-[calc(100vh-4rem)] p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/play"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Play Songs
          </Link>

          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold mb-2">Learn a Song</h1>
            <p className="text-muted-foreground">
              Upload a MIDI file to start learning
            </p>
          </div>

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
            <CardContent className="p-16 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".mid,.midi"
                onChange={handleInputChange}
                className="hidden"
              />

              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-gold animate-spin" />
                  <p className="text-muted-foreground">Parsing MIDI file...</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center">
                    <Piano className="w-10 h-10 text-gold" />
                  </div>
                  <h2 className="font-serif text-xl font-bold mb-2">Drop MIDI File Here</h2>
                  <p className="text-muted-foreground mb-6">
                    or click the button below to browse
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="gradient-gold text-black hover:opacity-90"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </>
              )}

              {error && (
                <Card className="mt-4 bg-destructive/20 border-destructive/50">
                  <CardContent className="p-4 text-destructive">
                    {error}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/play"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl font-bold">{song.name}</h1>
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <Badge variant="outline" className="border-gold/30 text-gold">
                  {Math.round(song.tempo)} BPM
                </Badge>
                <span>{song.timeSignature[0]}/{song.timeSignature[1]}</span>
                <span>{song.tracks.left.length} LH notes</span>
                <span>{song.tracks.right.length} RH notes</span>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Music className="w-4 h-4 mr-2" />
            Load Different Song
          </Button>
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
            >
              <Card className="mb-6 bg-gradient-to-r from-gold/20 to-gold-dark/20 border-gold/50">
                <CardContent className="p-6 text-center">
                  <PartyPopper className="w-12 h-12 mx-auto mb-2 text-gold" />
                  <h2 className="font-serif text-2xl font-bold text-gold mb-2">
                    Congratulations!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    You&apos;ve completed learning this piece!
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => {
                        useSongStore.getState().reset();
                        setCompleted(false);
                      }}
                      className="gradient-gold text-black hover:opacity-90"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Practice Again
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href="/play">
                        Choose Another Song
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step learner */}
        <StepLearner onComplete={handleComplete} />
      </div>
    </main>
  );
}
