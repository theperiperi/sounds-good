"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { playNoteForDuration, initAudio } from "@/lib/audio/synth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface Scale {
  name: string;
  pattern: number[];
  degrees: string[];
  description: string;
  color: string;
}

const SCALES: Scale[] = [
  {
    name: "Major",
    pattern: [0, 2, 4, 5, 7, 9, 11, 12],
    degrees: ["1", "2", "3", "4", "5", "6", "7", "8"],
    description: "Happy, bright. The foundation of Western music.",
    color: "from-gold to-gold-dark",
  },
  {
    name: "Natural Minor",
    pattern: [0, 2, 3, 5, 7, 8, 10, 12],
    degrees: ["1", "2", "b3", "4", "5", "b6", "b7", "8"],
    description: "Sad, melancholic. Used across all genres.",
    color: "from-gold to-gold-dark",
  },
  {
    name: "Harmonic Minor",
    pattern: [0, 2, 3, 5, 7, 8, 11, 12],
    degrees: ["1", "2", "b3", "4", "5", "b6", "7", "8"],
    description: "Exotic, dramatic. Middle Eastern flavor.",
    color: "from-gold to-gold-dark",
  },
  {
    name: "Dorian",
    pattern: [0, 2, 3, 5, 7, 9, 10, 12],
    degrees: ["1", "2", "b3", "4", "5", "6", "b7", "8"],
    description: "Minor but brighter. Popular in jazz & rock.",
    color: "from-gold to-gold-dark",
  },
  {
    name: "Mixolydian",
    pattern: [0, 2, 4, 5, 7, 9, 10, 12],
    degrees: ["1", "2", "3", "4", "5", "6", "b7", "8"],
    description: "Major but bluesy. Rock & folk favorite.",
    color: "from-gold to-gold-dark",
  },
  {
    name: "Pentatonic Major",
    pattern: [0, 2, 4, 7, 9, 12],
    degrees: ["1", "2", "3", "5", "6", "8"],
    description: "5 notes, no wrong notes. Great for improv.",
    color: "from-gold to-gold-dark",
  },
  {
    name: "Pentatonic Minor",
    pattern: [0, 3, 5, 7, 10, 12],
    degrees: ["1", "b3", "4", "5", "b7", "8"],
    description: "Blues foundation. Works over almost anything.",
    color: "from-gold to-gold-dark",
  },
  {
    name: "Blues",
    pattern: [0, 3, 5, 6, 7, 10, 12],
    degrees: ["1", "b3", "4", "b5", "5", "b7", "8"],
    description: "Minor pentatonic + the blue note. The blues sound.",
    color: "from-gold to-gold-dark",
  },
];

const ROOT_NOTE = 60;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C"];

export function ScaleVisualizer() {
  const [selectedScale, setSelectedScale] = useState<Scale>(SCALES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState<number | null>(null);

  const playScale = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    await initAudio();

    for (let i = 0; i < selectedScale.pattern.length; i++) {
      setTimeout(() => {
        const note = ROOT_NOTE + selectedScale.pattern[i];
        setCurrentNote(selectedScale.pattern[i]);
        playNoteForDuration(note, 0.3);

        if (i === selectedScale.pattern.length - 1) {
          setTimeout(() => {
            setCurrentNote(null);
            setIsPlaying(false);
          }, 400);
        }
      }, i * 300);
    }
  }, [selectedScale, isPlaying]);

  const getScaleInfo = (semitone: number) => {
    const normalizedSemitone = semitone % 12;
    let index = selectedScale.pattern.indexOf(normalizedSemitone);
    if (index === -1) {
      index = selectedScale.pattern.indexOf(normalizedSemitone + 12);
    }
    if (index === -1) return null;
    return {
      degree: selectedScale.degrees[index],
      index,
    };
  };

  const renderOctave = () => {
    const whiteKeys = [0, 2, 4, 5, 7, 9, 11, 12];
    const blackKeys = [
      { semitone: 1, position: 1 },
      { semitone: 3, position: 2 },
      { semitone: 6, position: 4 },
      { semitone: 8, position: 5 },
      { semitone: 10, position: 6 },
    ];

    return (
      <div className="relative inline-flex">
        {whiteKeys.map((semitone) => {
          const info = getScaleInfo(semitone);
          const isActive = currentNote === semitone || currentNote === semitone + 12 || currentNote === semitone - 12;
          const noteName = NOTE_NAMES[semitone];
          const isRoot = semitone === 0 || semitone === 12;

          return (
            <motion.div
              key={`white-${semitone}`}
              className={`relative w-14 h-40 rounded-b-lg border-x border-b flex flex-col items-center justify-between py-3 transition-all duration-100 ${
                isActive
                  ? "bg-gold border-gold-dark text-black shadow-glow-gold"
                  : info
                  ? isRoot
                    ? `bg-gradient-to-b ${selectedScale.color} border-transparent text-white`
                    : "bg-gold-light border-gold text-black"
                  : "bg-gray-200 border-gray-300 text-gray-400"
              }`}
              animate={{ y: isActive ? 2 : 0 }}
              transition={{ duration: 0.1 }}
            >
              {info && (
                <span className={`text-lg font-bold ${isActive ? "text-black" : ""}`}>
                  {info.degree}
                </span>
              )}
              {!info && <span />}
              <span className="text-sm font-medium">
                {noteName}
              </span>
            </motion.div>
          );
        })}

        {blackKeys.map(({ semitone, position }) => {
          const info = getScaleInfo(semitone);
          const isActive = currentNote === semitone;

          return (
            <motion.div
              key={`black-${semitone}`}
              className={`absolute top-0 w-9 h-24 rounded-b-lg flex flex-col items-center justify-start pt-2 z-10 transition-all duration-100 ${
                isActive
                  ? "bg-gold shadow-glow-gold"
                  : info
                  ? `bg-gradient-to-b ${selectedScale.color}`
                  : "bg-gray-500"
              }`}
              style={{ left: position * 56 - 18 }}
              animate={{ y: isActive ? 2 : 0 }}
              transition={{ duration: 0.1 }}
            >
              {info && (
                <span className="text-sm font-bold text-white">{info.degree}</span>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Scale selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SCALES.map((scale) => (
          <button
            key={scale.name}
            onClick={() => setSelectedScale(scale)}
            className={`p-4 rounded-xl text-left transition-all ${
              selectedScale.name === scale.name
                ? `bg-gradient-to-r ${scale.color} text-white shadow-lg`
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <div className="font-bold">{scale.name}</div>
            <div className="text-xs opacity-80 mt-1">
              {scale.pattern.length} notes
            </div>
          </button>
        ))}
      </div>

      {/* Keyboard visualization */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-8">
          <div className="flex justify-center overflow-x-auto pb-4">
            {renderOctave()}
          </div>

          {/* Scale pattern display */}
          <div className="flex justify-center gap-2 mt-6 mb-6">
            {selectedScale.degrees.map((degree, i) => (
              <motion.span
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-100 ${
                  currentNote === selectedScale.pattern[i]
                    ? "bg-gold text-black scale-110 shadow-glow-gold"
                    : `bg-gradient-to-r ${selectedScale.color} text-white`
                }`}
                animate={{
                  scale: currentNote === selectedScale.pattern[i] ? 1.1 : 1,
                }}
              >
                {degree}
              </motion.span>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={playScale}
              disabled={isPlaying}
              className={`px-8 ${
                isPlaying
                  ? "bg-gold text-black"
                  : `bg-gradient-to-r ${selectedScale.color} hover:opacity-90`
              }`}
            >
              <Play className="w-4 h-4 mr-2" />
              {isPlaying ? "Playing..." : "Play Scale"}
            </Button>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded bg-gradient-to-r ${selectedScale.color}`} />
              <span className="text-muted-foreground">Scale tones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gold" />
              <span className="text-muted-foreground">Currently playing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scale info */}
      <motion.div
        key={selectedScale.name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`bg-gradient-to-r ${selectedScale.color} border-none`}>
          <CardContent className="p-6 text-white">
            <h3 className="font-serif text-2xl font-bold mb-2">{selectedScale.name} Scale</h3>
            <p className="text-white/90">{selectedScale.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm opacity-80">Intervals:</span>
              {selectedScale.pattern.slice(0, -1).map((interval, i) => (
                <span key={i} className="px-2 py-1 bg-white/20 rounded text-sm">
                  {interval === 0 ? "R" : interval}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Educational content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-5">
            <h4 className="font-bold mb-2">Reading Scale Degrees</h4>
            <p className="text-muted-foreground text-sm">
              Numbers show scale degrees: 1 is the root. A &quot;b&quot; (flat) means one semitone lower
              than the major scale. So b3 is a minor 3rd (3 semitones), while 3 is a major 3rd (4 semitones).
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-5">
            <h4 className="font-bold mb-2">Using Scales</h4>
            <p className="text-muted-foreground text-sm">
              Scales give you a palette of notes that work well together. Pentatonic scales
              (5 notes) are beginner-friendly with no &quot;wrong&quot; notes. Major/minor scales define
              the mood of a piece.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
