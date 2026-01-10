"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { playNoteForDuration, initAudio } from "@/lib/audio/synth";

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
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Natural Minor",
    pattern: [0, 2, 3, 5, 7, 8, 10, 12],
    degrees: ["1", "2", "b3", "4", "5", "b6", "b7", "8"],
    description: "Sad, melancholic. Used across all genres.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Harmonic Minor",
    pattern: [0, 2, 3, 5, 7, 8, 11, 12],
    degrees: ["1", "2", "b3", "4", "5", "b6", "7", "8"],
    description: "Exotic, dramatic. Middle Eastern flavor.",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Dorian",
    pattern: [0, 2, 3, 5, 7, 9, 10, 12],
    degrees: ["1", "2", "b3", "4", "5", "6", "b7", "8"],
    description: "Minor but brighter. Popular in jazz & rock.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    name: "Mixolydian",
    pattern: [0, 2, 4, 5, 7, 9, 10, 12],
    degrees: ["1", "2", "3", "4", "5", "6", "b7", "8"],
    description: "Major but bluesy. Rock & folk favorite.",
    color: "from-red-500 to-rose-500",
  },
  {
    name: "Pentatonic Major",
    pattern: [0, 2, 4, 7, 9, 12],
    degrees: ["1", "2", "3", "5", "6", "8"],
    description: "5 notes, no wrong notes. Great for improv.",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Pentatonic Minor",
    pattern: [0, 3, 5, 7, 10, 12],
    degrees: ["1", "b3", "4", "5", "b7", "8"],
    description: "Blues foundation. Works over almost anything.",
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Blues",
    pattern: [0, 3, 5, 6, 7, 10, 12],
    degrees: ["1", "b3", "4", "b5", "5", "b7", "8"],
    description: "Minor pentatonic + blue note. The blues sound.",
    color: "from-indigo-600 to-blue-700",
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

  // Check if a semitone is in the scale
  const getScaleInfo = (semitone: number) => {
    const normalizedSemitone = semitone % 12;
    // Check both the semitone and semitone+12 (for the octave)
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

  // Render an octave of piano keys - larger version
  const renderOctave = () => {
    const whiteKeys = [0, 2, 4, 5, 7, 9, 11, 12]; // C D E F G A B C
    const blackKeys = [
      { semitone: 1, position: 1 },   // C#
      { semitone: 3, position: 2 },   // D#
      { semitone: 6, position: 4 },   // F#
      { semitone: 8, position: 5 },   // G#
      { semitone: 10, position: 6 },  // A#
    ];

    return (
      <div className="relative inline-flex">
        {/* White keys */}
        {whiteKeys.map((semitone, i) => {
          const info = getScaleInfo(semitone);
          const isActive = currentNote === semitone || currentNote === semitone + 12 || currentNote === semitone - 12;
          const noteName = NOTE_NAMES[semitone];
          const isRoot = semitone === 0 || semitone === 12;

          return (
            <motion.div
              key={`white-${semitone}`}
              className={`relative w-14 h-40 rounded-b-lg border-x border-b flex flex-col items-center justify-between py-3 transition-all duration-100 ${
                isActive
                  ? "bg-green-400 border-green-500 text-white shadow-lg shadow-green-400/50"
                  : info
                  ? isRoot
                    ? `bg-gradient-to-b ${selectedScale.color} border-transparent text-white`
                    : "bg-indigo-100 border-indigo-200 text-indigo-800"
                  : "bg-gray-200 border-gray-300 text-gray-400"
              }`}
              animate={{ y: isActive ? 2 : 0 }}
              transition={{ duration: 0.1 }}
            >
              {/* Degree number at top of key */}
              {info && (
                <span className={`text-lg font-bold ${isActive ? "text-white" : ""}`}>
                  {info.degree}
                </span>
              )}
              {!info && <span />}

              {/* Note name at bottom */}
              <span className="text-sm font-medium">
                {noteName}
              </span>
            </motion.div>
          );
        })}

        {/* Black keys */}
        {blackKeys.map(({ semitone, position }) => {
          const info = getScaleInfo(semitone);
          const isActive = currentNote === semitone;

          return (
            <motion.div
              key={`black-${semitone}`}
              className={`absolute top-0 w-9 h-24 rounded-b-lg flex flex-col items-center justify-start pt-2 z-10 transition-all duration-100 ${
                isActive
                  ? "bg-green-500 shadow-lg shadow-green-500/50"
                  : info
                  ? `bg-gradient-to-b ${selectedScale.color}`
                  : "bg-gray-500"
              }`}
              style={{ left: position * 56 - 18 }} // 56px = white key width
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
                : "bg-gray-800 hover:bg-gray-700"
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
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
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
                  ? "bg-green-400 text-white scale-110 shadow-lg shadow-green-400/50"
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
          <button
            onClick={playScale}
            disabled={isPlaying}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              isPlaying
                ? "bg-green-500"
                : `bg-gradient-to-r ${selectedScale.color} hover:opacity-90`
            } disabled:opacity-50`}
          >
            {isPlaying ? "Playing..." : "Play Scale"}
          </button>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded bg-gradient-to-r ${selectedScale.color}`} />
            <span className="text-gray-400">Scale tones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-400" />
            <span className="text-gray-400">Currently playing</span>
          </div>
        </div>
      </div>

      {/* Scale info */}
      <motion.div
        key={selectedScale.name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${selectedScale.color} rounded-2xl p-6 text-white`}
      >
        <h3 className="text-2xl font-bold mb-2">{selectedScale.name} Scale</h3>
        <p className="text-white/90">{selectedScale.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm opacity-80">Intervals:</span>
          {selectedScale.pattern.slice(0, -1).map((interval, i) => (
            <span key={i} className="px-2 py-1 bg-white/20 rounded text-sm">
              {interval === 0 ? "R" : interval}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Educational content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <h4 className="font-bold mb-2">Reading Scale Degrees</h4>
          <p className="text-gray-400 text-sm">
            Numbers show scale degrees: 1 is the root. A &quot;b&quot; (flat) means one semitone lower
            than the major scale. So b3 is a minor 3rd (3 semitones), while 3 is a major 3rd (4 semitones).
          </p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <h4 className="font-bold mb-2">Using Scales</h4>
          <p className="text-gray-400 text-sm">
            Scales give you a palette of notes that work well together. Pentatonic scales
            (5 notes) are beginner-friendly with no &quot;wrong&quot; notes. Major/minor scales define
            the mood of a piece.
          </p>
        </div>
      </div>
    </div>
  );
}
