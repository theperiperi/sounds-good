"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard } from "@/components/keyboard/Keyboard";
import { FallingNotes } from "./FallingNotes";
import { useSongStore, HandMode } from "@/stores/songStore";
import { ParsedNote } from "@/lib/midi/parser";
import { initAudio, playNoteForDuration } from "@/lib/audio/synth";
import { onMidiNote, initMidi } from "@/lib/midi/input";

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
      }, i * 50); // Slight stagger for chords so you can hear each note
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

  // Get highlighted keys for keyboard
  const highlightedKeys = currentStep.map((note) => ({
    midi: note.midi,
    color: note.hand === "left" ? "#3b82f6" : "#6366f1", // blue for left, indigo for right
    finger: showFingering ? note.finger : undefined,
  }));

  // Get all notes for falling notes display - access primitive values to avoid infinite loop
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
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">No song loaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        {/* Hand selection */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Hand:</span>
          <div className="flex bg-gray-900 rounded-lg p-1">
            {(["left", "right", "both"] as HandMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setHandMode(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  handMode === mode
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {mode === "left" ? "Left" : mode === "right" ? "Right" : "Both"}
              </button>
            ))}
          </div>
        </div>

        {/* Mode selection */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Mode:</span>
          <div className="flex bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setLearnMode("practice")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                learnMode === "practice"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Practice
            </button>
            <button
              onClick={() => setLearnMode("watch")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                learnMode === "watch"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Watch
            </button>
          </div>
        </div>

        {/* Tempo control */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Tempo:</span>
          <button
            onClick={() => setTempo(tempo - 25)}
            className="w-8 h-8 bg-gray-700 rounded hover:bg-gray-600"
          >
            -
          </button>
          <span className="w-12 text-center font-medium">{tempo}%</span>
          <button
            onClick={() => setTempo(tempo + 25)}
            className="w-8 h-8 bg-gray-700 rounded hover:bg-gray-600"
          >
            +
          </button>
        </div>

        {/* Toggle buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFingering}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              showFingering
                ? "bg-indigo-600 text-white"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            Fingering
          </button>
          <button
            onClick={toggleAudio}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              audioEnabled
                ? "bg-indigo-600 text-white"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            Audio
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${getProgress()}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Step {currentStepIndex + 1} of {steps.length}
          {song && ` • Measure ${Math.floor(currentTime / (240 / song.tempo)) + 1}`}
        </div>
        <div className="flex items-center gap-2">
          {midiConnected ? (
            <span className="flex items-center gap-1 text-sm text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              MIDI Connected
            </span>
          ) : (
            <span className="text-sm text-gray-500">No MIDI device</span>
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
          className={`bg-gray-800/50 border rounded-xl p-6 text-center ${
            feedback === "correct"
              ? "border-green-500 bg-green-500/10"
              : feedback === "wrong"
              ? "border-red-500 bg-red-500/10"
              : "border-gray-700"
          }`}
        >
          <div className="text-lg font-medium mb-4">
            {learnMode === "watch" ? "Watching..." : "Play these notes:"}
          </div>

          <div className="flex justify-center gap-4 mb-4">
            {currentStep.map((note, i) => (
              <div
                key={i}
                className={`px-4 py-3 rounded-xl ${
                  correctNotes.has(note.midi)
                    ? "bg-green-500 text-white"
                    : note.hand === "left"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50"
                }`}
              >
                <div className="text-2xl font-bold">{note.name}</div>
                {showFingering && note.finger && (
                  <div className="text-sm mt-1">
                    Finger {note.finger} • {note.hand === "left" ? "L" : "R"}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={playReference}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            Hear Reference
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Keyboard */}
      <div className="flex justify-center overflow-x-auto pb-4">
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

      {/* Navigation buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => prevStep()}
          disabled={currentStepIndex === 0}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => nextStep()}
          disabled={currentStepIndex === steps.length - 1}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
