"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard } from "@/components/keyboard/Keyboard";
import { FallingNotes } from "./FallingNotes";
import { useSongStore, HandMode } from "@/stores/songStore";
import { ParsedNote } from "@/lib/midi/parser";
import { initAudio, playNoteForDuration } from "@/lib/audio/synth";
import { onMidiNote, initMidi } from "@/lib/midi/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Hand,
  Eye,
  Keyboard as KeyboardIcon,
  Minus,
  Plus,
  Music,
  Fingerprint
} from "lucide-react";

interface StepLearnerProps {
  onComplete?: () => void;
}

export function StepLearner({ onComplete }: StepLearnerProps) {
  const {
    song,
    steps,
    currentStepIndex,
    handMode,
    learnMode,
    showFingering,
    audioEnabled,
    tempo,
    nextStep,
    prevStep,
    goToStep,
    reset,
    setHandMode,
    setLearnMode,
    toggleFingering,
    toggleAudio,
    setTempo,
    getProgress,
  } = useSongStore();

  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const [correctNotes, setCorrectNotes] = useState<Set<number>>(new Set());
  const [wrongNotes, setWrongNotes] = useState<Set<number>>(new Set());
  const [midiConnected, setMidiConnected] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const audioInitialized = useRef(false);

  const currentStep = steps[currentStepIndex] || [];
  const currentTime = currentStep[0]?.time || 0;

  // Initialize audio and MIDI
  useEffect(() => {
    if (!audioInitialized.current) {
      initAudio();
      audioInitialized.current = true;
    }

    initMidi().then(({ success, devices }) => {
      setMidiConnected(success && devices.length > 0);
    });
  }, []);

  // MIDI input handler
  useEffect(() => {
    const unsubscribe = onMidiNote((note, velocity, isNoteOn) => {
      if (isNoteOn) {
        setActiveKeys((prev) => new Set(prev).add(note));
        checkNote(note);
      } else {
        setActiveKeys((prev) => {
          const next = new Set(prev);
          next.delete(note);
          return next;
        });
      }
    });

    return unsubscribe;
  }, [currentStep, correctNotes]);

  // Check if played note matches expected notes
  const checkNote = useCallback(
    (playedMidi: number) => {
      if (learnMode === "watch") return;

      const expectedNotes = currentStep.map((n) => n.midi);

      if (expectedNotes.includes(playedMidi)) {
        // Correct note!
        setCorrectNotes((prev) => new Set(prev).add(playedMidi));
        setWrongNotes((prev) => {
          const next = new Set(prev);
          next.delete(playedMidi);
          return next;
        });

        // Play audio feedback if enabled
        if (audioEnabled) {
          playNoteForDuration(playedMidi, 0.3, 0.6);
        }

        // Check if all notes in step are correct
        const newCorrect = new Set(correctNotes).add(playedMidi);
        const allCorrect = expectedNotes.every((midi) => newCorrect.has(midi));

        if (allCorrect) {
          setFeedback("correct");
          setTimeout(() => {
            setFeedback(null);
            setCorrectNotes(new Set());

            // Advance to next step
            if (currentStepIndex < steps.length - 1) {
              nextStep();
            } else {
              // Completed!
              onComplete?.();
            }
          }, 300);
        }
      } else {
        // Wrong note
        setWrongNotes((prev) => new Set(prev).add(playedMidi));
        setFeedback("wrong");

        // Play audio for wrong note too (so user hears what they played)
        if (audioEnabled) {
          playNoteForDuration(playedMidi, 0.2, 0.4);
        }

        setTimeout(() => {
          setFeedback(null);
          setWrongNotes(new Set());
        }, 500);
      }
    },
    [currentStep, correctNotes, currentStepIndex, steps.length, nextStep, audioEnabled, learnMode, onComplete]
  );

  // Keyboard click handler (for mouse/touch input)
  const handleKeyPress = useCallback(
    (midi: number) => {
      setActiveKeys((prev) => new Set(prev).add(midi));
      checkNote(midi);
    },
    [checkNote]
  );

  const handleKeyRelease = useCallback((midi: number) => {
    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
  }, []);

  // Play reference audio for current step
  const playReference = useCallback(async () => {
    await initAudio();
    currentStep.forEach((note, i) => {
      setTimeout(() => {
        playNoteForDuration(note.midi, note.duration * (100 / tempo), 0.7);
      }, i * 50);
    });
  }, [currentStep, tempo]);

  // Watch mode - auto-play through the song
  useEffect(() => {
    if (learnMode !== "watch") return;

    const interval = setInterval(() => {
      if (audioEnabled) {
        currentStep.forEach((note) => {
          playNoteForDuration(note.midi, note.duration * (100 / tempo), 0.7);
        });
      }

      if (currentStepIndex < steps.length - 1) {
        nextStep();
      }
    }, (60000 / (song?.tempo || 120)) * (100 / tempo));

    return () => clearInterval(interval);
  }, [learnMode, currentStep, currentStepIndex, steps.length, nextStep, audioEnabled, tempo, song?.tempo]);

  // Get highlighted keys for keyboard - use GOLD for highlights
  const highlightedKeys = currentStep.map((note) => ({
    midi: note.midi,
    color: note.hand === "left" ? "#d4a853" : "#e8c87a", // gold for left, light gold for right
    finger: showFingering ? note.finger : undefined,
  }));

  // Get all notes for falling notes display
  const songTracks = useSongStore((state) => state.song?.tracks);
  const allNotes = useMemo(() => {
    if (!songTracks) return [];
    if (handMode === "left") {
      return [...songTracks.left].sort((a, b) => a.time - b.time);
    } else if (handMode === "right") {
      return [...songTracks.right].sort((a, b) => a.time - b.time);
    }
    return [...songTracks.all].sort((a, b) => a.time - b.time);
  }, [songTracks, handMode]);

  if (!song) {
    return (
      <Card className="bg-card/50 border-border">
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">No song loaded</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Hand selection */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">Hand</span>
              <div className="flex bg-secondary rounded-lg p-1">
                {(["left", "right", "both"] as HandMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setHandMode(mode)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      handMode === mode
                        ? "gradient-gold text-black shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mode === "left" ? "Left" : mode === "right" ? "Right" : "Both"}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode selection */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">Mode</span>
              <div className="flex bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setLearnMode("practice")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    learnMode === "practice"
                      ? "gradient-gold text-black shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <KeyboardIcon className="w-3.5 h-3.5" />
                  Practice
                </button>
                <button
                  onClick={() => setLearnMode("watch")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    learnMode === "watch"
                      ? "gradient-gold text-black shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Watch
                </button>
              </div>
            </div>

            {/* Tempo control */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">Tempo</span>
              <div className="flex items-center bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setTempo(Math.max(25, tempo - 25))}
                  className="w-8 h-8 rounded-md hover:bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-16 text-center font-bold text-gold">{tempo}%</span>
                <button
                  onClick={() => setTempo(Math.min(200, tempo + 25))}
                  className="w-8 h-8 rounded-md hover:bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Toggle buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={showFingering ? "default" : "secondary"}
                size="sm"
                onClick={toggleFingering}
                className={showFingering ? "gradient-gold text-black hover:opacity-90" : ""}
              >
                <Fingerprint className="w-4 h-4 mr-1.5" />
                Fingering
              </Button>
              <Button
                variant={audioEnabled ? "default" : "secondary"}
                size="sm"
                onClick={toggleAudio}
                className={audioEnabled ? "gradient-gold text-black hover:opacity-90" : ""}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4 mr-1.5" /> : <VolumeX className="w-4 h-4 mr-1.5" />}
                Audio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress bar */}
      <div className="relative">
        <Progress value={getProgress()} className="h-2" />
      </div>

      {/* Step info */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">Step {currentStepIndex + 1}</span>
          <span className="mx-1.5">of</span>
          <span>{steps.length}</span>
          {song && (
            <>
              <span className="mx-2 text-border">•</span>
              <span>Measure {Math.floor(currentTime / (240 / song.tempo)) + 1}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {midiConnected ? (
            <Badge variant="outline" className="border-gold/30 text-gold">
              <span className="w-1.5 h-1.5 bg-gold rounded-full mr-1.5 animate-pulse" />
              MIDI Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
              No MIDI device
            </Badge>
          )}
        </div>
      </div>

      {/* Falling notes visualization */}
      <div className="flex justify-center overflow-x-auto">
        <FallingNotes
          notes={allNotes}
          currentTime={currentTime}
          visibleDuration={3}
        />
      </div>

      {/* Current step display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Card className={`border-2 transition-colors ${
            feedback === "correct"
              ? "border-gold bg-gold/5"
              : feedback === "wrong"
              ? "border-red-500 bg-red-500/5"
              : "border-border bg-card/50"
          }`}>
            <CardContent className="p-6 text-center">
              <div className="text-sm font-medium text-muted-foreground mb-4">
                {learnMode === "watch" ? "Watching playback..." : "Play these notes"}
              </div>

              <div className="flex justify-center gap-3 flex-wrap mb-6">
                {currentStep.map((note, i) => (
                  <div
                    key={i}
                    className={`relative px-6 py-4 rounded-xl transition-all ${
                      correctNotes.has(note.midi)
                        ? "bg-gold text-black shadow-lg shadow-gold/30"
                        : "bg-gradient-to-b from-gold/20 to-gold/10 border border-gold/30 text-foreground"
                    }`}
                  >
                    <div className="text-2xl font-bold font-serif">{note.name}</div>
                    {showFingering && note.finger && (
                      <div className="text-xs mt-1 text-muted-foreground">
                        <Badge variant="outline" className={`text-xs ${
                          note.hand === "left"
                            ? "border-gold/50 bg-gold/10 text-gold"
                            : "border-gold-light/50 bg-gold-light/10 text-gold-light"
                        }`}>
                          {note.hand === "left" ? "L" : "R"}{note.finger}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={playReference}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Hear Reference
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Keyboard */}
      <Card className="bg-card/50 border-border overflow-visible">
        <CardContent className="p-6 overflow-visible">
          <div className="flex justify-center overflow-x-auto">
            <Keyboard
              startOctave={2}
              octaves={4}
              highlightedKeys={highlightedKeys}
              activeKeys={Array.from(activeKeys)}
              wrongKeys={Array.from(wrongNotes)}
              onNoteOn={handleKeyPress}
              onNoteOff={handleKeyRelease}
              showLabels
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-center gap-3">
        <Button
          variant="secondary"
          onClick={() => prevStep()}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="secondary"
          onClick={() => reset()}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
        <Button
          onClick={() => nextStep()}
          disabled={currentStepIndex === steps.length - 1}
          className="gradient-gold text-black hover:opacity-90"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
