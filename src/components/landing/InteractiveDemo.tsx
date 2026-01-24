"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Music, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Keyboard, HighlightedKey } from "@/components/keyboard/Keyboard";
import { initAudio, playNoteForDuration } from "@/lib/audio/synth";

// Twinkle Twinkle Little Star - CCGGAAG FFEEDDC
// With finger numbers for right hand (thumb=1, pinky=5)
interface DemoNote {
  midi: number;
  name: string;
  finger: number;
  time: number;
  duration: number;
}

const TWINKLE_NOTES: DemoNote[] = [
  { midi: 60, name: "C", finger: 1, time: 0, duration: 0.5 },
  { midi: 60, name: "C", finger: 1, time: 0.5, duration: 0.5 },
  { midi: 67, name: "G", finger: 5, time: 1, duration: 0.5 },
  { midi: 67, name: "G", finger: 5, time: 1.5, duration: 0.5 },
  { midi: 69, name: "A", finger: 5, time: 2, duration: 0.5 },
  { midi: 69, name: "A", finger: 5, time: 2.5, duration: 0.5 },
  { midi: 67, name: "G", finger: 5, time: 3, duration: 1 },
  { midi: 65, name: "F", finger: 4, time: 4, duration: 0.5 },
  { midi: 65, name: "F", finger: 4, time: 4.5, duration: 0.5 },
  { midi: 64, name: "E", finger: 3, time: 5, duration: 0.5 },
  { midi: 64, name: "E", finger: 3, time: 5.5, duration: 0.5 },
  { midi: 62, name: "D", finger: 2, time: 6, duration: 0.5 },
  { midi: 62, name: "D", finger: 2, time: 6.5, duration: 0.5 },
  { midi: 60, name: "C", finger: 1, time: 7, duration: 1 },
];

// Key layout constants matching FallingNotes component
const WHITE_KEY_WIDTH = 48; // matches Keyboard component w-12 = 48px
const BLACK_KEY_WIDTH = 32;

const KEY_INFO: { [midi: number]: { isBlack: boolean; xOffset: number } } = {};

function initKeyInfo() {
  const blackKeyPattern = [1, 3, 6, 8, 10];
  let whiteKeyIndex = 0;

  // Generate for octaves 3-5 (MIDI 48-83) to cover our demo range
  for (let octave = 3; octave <= 5; octave++) {
    const baseNote = octave * 12;
    for (let i = 0; i < 12; i++) {
      const midi = baseNote + i;
      const isBlack = blackKeyPattern.includes(i);

      if (isBlack) {
        const prevWhiteMidi = midi - 1;
        const prevWhiteX = KEY_INFO[prevWhiteMidi]?.xOffset || 0;
        KEY_INFO[midi] = {
          isBlack: true,
          xOffset: prevWhiteX + WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2,
        };
      } else {
        KEY_INFO[midi] = {
          isBlack: false,
          xOffset: whiteKeyIndex * WHITE_KEY_WIDTH,
        };
        whiteKeyIndex++;
      }
    }
  }
}

initKeyInfo();

// Calculate keyboard width for 2 octaves starting at C4 (MIDI 60)
const KEYBOARD_START_MIDI = 48; // C3
const KEYBOARD_END_MIDI = 72; // C5
const VISIBLE_DURATION = 3; // seconds of notes visible

export function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeKeys, setActiveKeys] = useState<number[]>([]);
  const [wrongKeys, setWrongKeys] = useState<number[]>([]);
  const [audioReady, setAudioReady] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const currentNote = TWINKLE_NOTES[currentStep];
  const currentTime = currentNote?.time || 0;
  const progress = (currentStep / TWINKLE_NOTES.length) * 100;

  // Get visible notes for falling display
  const visibleNotes = useMemo(() => {
    return TWINKLE_NOTES.filter((note) => {
      const noteEnd = note.time + note.duration;
      const windowStart = currentTime;
      const windowEnd = currentTime + VISIBLE_DURATION;
      return noteEnd > windowStart && note.time < windowEnd;
    });
  }, [currentTime]);

  // Calculate keyboard width
  const keyboardWidth = useMemo(() => {
    let count = 0;
    for (let midi = KEYBOARD_START_MIDI; midi <= KEYBOARD_END_MIDI; midi++) {
      if (!KEY_INFO[midi]?.isBlack) count++;
    }
    return count * WHITE_KEY_WIDTH;
  }, []);

  const getKeyX = (midi: number): number => {
    const keyInfo = KEY_INFO[midi];
    const startKeyInfo = KEY_INFO[KEYBOARD_START_MIDI];
    if (!keyInfo || !startKeyInfo) return 0;
    return keyInfo.xOffset - startKeyInfo.xOffset;
  };

  const ensureAudio = useCallback(async () => {
    if (!audioReady) {
      await initAudio();
      setAudioReady(true);
    }
  }, [audioReady]);

  const handleNoteOn = useCallback(
    async (midi: number) => {
      if (isComplete) return;

      await ensureAudio();
      setActiveKeys((prev) => [...prev, midi]);

      // Check if correct note
      if (midi === currentNote.midi) {
        // Correct! Play audio and advance
        playNoteForDuration(midi, 0.3, 0.6);
        setFeedback("correct");
        setWrongKeys([]);

        setTimeout(() => {
          setFeedback(null);
          if (currentStep < TWINKLE_NOTES.length - 1) {
            setCurrentStep((prev) => prev + 1);
          } else {
            setIsComplete(true);
          }
        }, 300);
      } else {
        // Wrong note
        playNoteForDuration(midi, 0.2, 0.4);
        setWrongKeys([midi]);
        setFeedback("wrong");

        setTimeout(() => {
          setFeedback(null);
          setWrongKeys([]);
        }, 500);
      }
    },
    [ensureAudio, currentNote, currentStep, isComplete]
  );

  const handleNoteOff = useCallback((midi: number) => {
    setActiveKeys((prev) => prev.filter((k) => k !== midi));
  }, []);

  const resetDemo = useCallback(() => {
    setCurrentStep(0);
    setIsComplete(false);
    setFeedback(null);
    setWrongKeys([]);
    setActiveKeys([]);
  }, []);

  // Get highlighted keys for keyboard
  const highlightedKeys: HighlightedKey[] = useMemo(() => {
    if (isComplete || !currentNote) return [];
    return [
      {
        midi: currentNote.midi,
        color: "#e8c87a", // gold-light for right hand
        finger: currentNote.finger,
      },
    ];
  }, [currentNote, isComplete]);

  const containerHeight = 200;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Mac Window Frame */}
      <div className="rounded-xl overflow-hidden shadow-premium-lg border border-border/50">
        {/* Window Title Bar */}
        <div className="bg-card/95 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-border/50">
          {/* Traffic lights */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>

          {/* Title */}
          <div className="flex-1 text-center">
            <span className="text-sm text-muted-foreground font-medium">
              Sounds Good — Learn Mode
            </span>
          </div>

          {/* Spacer for symmetry */}
          <div className="w-14" />
        </div>

        {/* Window Content */}
        <div className="bg-background/95 backdrop-blur-xl p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
                <Music className="w-5 h-5 text-background" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold">
                  Twinkle Twinkle Little Star
                </h3>
                <p className="text-sm text-muted-foreground">
                  Step {Math.min(currentStep + 1, TWINKLE_NOTES.length)} of{" "}
                  {TWINKLE_NOTES.length}
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={resetDemo}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-2 mb-4" />

          {/* Completion overlay */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass rounded-xl p-6 text-center border border-primary/30 mb-4"
              >
                <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-background" />
                </div>
                <h4 className="font-serif text-xl font-semibold mb-2">
                  Great job!
                </h4>
                <p className="text-muted-foreground text-sm mb-4">
                  You completed the first phrase of Twinkle Twinkle Little Star
                </p>
                <Button
                  onClick={resetDemo}
                  className="gradient-gold text-background hover:opacity-90"
                >
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current step display */}
          {!isComplete && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-xl border-2 p-4 mb-4 transition-colors ${
                  feedback === "correct"
                    ? "border-gold bg-gold/5"
                    : feedback === "wrong"
                      ? "border-red-500 bg-red-500/5"
                      : "border-border bg-card/50"
                }`}
              >
                <div className="text-sm font-medium text-muted-foreground mb-3 text-center">
                  Play this note
                </div>
                <div className="flex justify-center">
                  <div
                    className={`relative px-8 py-4 rounded-xl transition-all ${
                      feedback === "correct"
                        ? "bg-gold text-black shadow-lg shadow-gold/30"
                        : "bg-gradient-to-b from-gold/20 to-gold/10 border border-gold/30"
                    }`}
                  >
                    <div className="text-3xl font-bold font-serif">
                      {currentNote.name}
                    </div>
                    <div className="text-xs mt-1 text-center">
                      <Badge
                        variant="outline"
                        className="border-gold-light/50 bg-gold-light/10 text-gold-light"
                      >
                        R{currentNote.finger}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Falling Notes - matching actual product */}
          {!isComplete && (
            <div className="flex justify-center overflow-x-auto mb-0">
              <div
                className="relative bg-background/80 border border-border rounded-t-2xl overflow-hidden"
                style={{ width: keyboardWidth, height: containerHeight }}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {[0.25, 0.5, 0.75, 1].map((fraction) => (
                    <div
                      key={fraction}
                      className="absolute w-full border-t border-border/30"
                      style={{ top: `${fraction * 100}%` }}
                    />
                  ))}
                </div>

                {/* Falling notes */}
                {visibleNotes.map((note, i) => {
                  const keyInfo = KEY_INFO[note.midi];
                  if (!keyInfo) return null;

                  const x = getKeyX(note.midi);
                  const width = keyInfo.isBlack
                    ? BLACK_KEY_WIDTH - 4
                    : WHITE_KEY_WIDTH - 4;

                  const timeFromNow = note.time - currentTime;
                  const normalizedY = 1 - timeFromNow / VISIBLE_DURATION;
                  const y = normalizedY * containerHeight;

                  const noteHeight = Math.max(
                    24,
                    (note.duration / VISIBLE_DURATION) * containerHeight
                  );

                  const isActive = note.time === currentTime;

                  return (
                    <motion.div
                      key={`${note.midi}-${note.time}`}
                      className={`absolute rounded-md ${
                        isActive
                          ? "bg-gold-light shadow-lg shadow-gold/40"
                          : "bg-gold shadow-sm shadow-gold/20"
                      }`}
                      style={{
                        left: x + 2,
                        width,
                        height: noteHeight,
                        bottom: containerHeight - y,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isActive ? 1 : 0.85 }}
                      transition={{ duration: 0.1 }}
                    >
                      {/* Finger number */}
                      <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-black">
                        {note.finger}
                      </span>
                    </motion.div>
                  );
                })}

                {/* "Now" line at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />

                {/* Hand label */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-gold text-black text-xs font-bold px-2 py-0.5">
                    R
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Keyboard - using actual component */}
          <div className="flex justify-center overflow-x-auto">
            <Keyboard
              startOctave={3}
              octaves={2}
              highlightedKeys={highlightedKeys}
              activeKeys={activeKeys}
              wrongKeys={wrongKeys}
              onNoteOn={handleNoteOn}
              onNoteOff={handleNoteOff}
              showLabels
            />
          </div>

          {/* Instructions */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Click keys or use keyboard: A-L for white keys, W-P for black keys
          </p>
        </div>
      </div>
    </div>
  );
}
