"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { playNoteForDuration, initAudio } from "@/lib/audio/synth";

interface Progression {
  name: string;
  numerals: string[];
  chords: number[][]; // MIDI notes for each chord
  description: string;
  songs: string[];
}

const PROGRESSIONS: Progression[] = [
  {
    name: "I - IV - V - I",
    numerals: ["I", "IV", "V", "I"],
    chords: [
      [60, 64, 67], // C
      [65, 69, 72], // F
      [67, 71, 74], // G
      [60, 64, 67], // C
    ],
    description: "The foundation of Western music. Strong, resolved, classic.",
    songs: ["Twist and Shout", "La Bamba", "Wild Thing"],
  },
  {
    name: "I - V - vi - IV",
    numerals: ["I", "V", "vi", "IV"],
    chords: [
      [60, 64, 67], // C
      [67, 71, 74], // G
      [69, 72, 76], // Am
      [65, 69, 72], // F
    ],
    description: "The 'pop' progression. Emotional, familiar, powerful.",
    songs: ["Let It Be", "No Woman No Cry", "With or Without You"],
  },
  {
    name: "vi - IV - I - V",
    numerals: ["vi", "IV", "I", "V"],
    chords: [
      [69, 72, 76], // Am
      [65, 69, 72], // F
      [60, 64, 67], // C
      [67, 71, 74], // G
    ],
    description: "Emotional minor start. Builds hope.",
    songs: ["Despacito", "Africa", "Zombie"],
  },
  {
    name: "ii - V - I",
    numerals: ["ii", "V", "I"],
    chords: [
      [62, 65, 69], // Dm
      [67, 71, 74], // G
      [60, 64, 67], // C
    ],
    description: "The essential jazz progression. Smooth resolution.",
    songs: ["Autumn Leaves", "Fly Me to the Moon", "All of Me"],
  },
  {
    name: "I - vi - IV - V",
    numerals: ["I", "vi", "IV", "V"],
    chords: [
      [60, 64, 67], // C
      [69, 72, 76], // Am
      [65, 69, 72], // F
      [67, 71, 74], // G
    ],
    description: "50s doo-wop progression. Nostalgic, romantic.",
    songs: ["Stand By Me", "Every Breath You Take", "Unchained Melody"],
  },
  {
    name: "I - IV - vi - V",
    numerals: ["I", "IV", "vi", "V"],
    chords: [
      [60, 64, 67], // C
      [65, 69, 72], // F
      [69, 72, 76], // Am
      [67, 71, 74], // G
    ],
    description: "Hopeful and uplifting. Common in anthems.",
    songs: ["Hey Ya!", "Take On Me", "What Makes You Beautiful"],
  },
];

export function ChordProgressionPlayer() {
  const [selectedProgression, setSelectedProgression] = useState(PROGRESSIONS[1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState<number | null>(null);

  const playProgression = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    await initAudio();

    const chords = selectedProgression.chords;
    const duration = 800; // ms per chord

    for (let i = 0; i < chords.length; i++) {
      setTimeout(() => {
        setCurrentChordIndex(i);
        chords[i].forEach((note) => {
          playNoteForDuration(note, 0.7);
        });

        if (i === chords.length - 1) {
          setTimeout(() => {
            setCurrentChordIndex(null);
            setIsPlaying(false);
          }, 800);
        }
      }, i * duration);
    }
  }, [selectedProgression, isPlaying]);

  return (
    <div className="space-y-8">
      {/* Progression selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PROGRESSIONS.map((prog) => (
          <button
            key={prog.name}
            onClick={() => setSelectedProgression(prog)}
            className={`p-4 rounded-xl text-left transition-all ${
              selectedProgression.name === prog.name
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <div className="font-bold">{prog.name}</div>
            <div className="text-xs opacity-75 mt-1">
              {prog.numerals.join(" → ")}
            </div>
          </button>
        ))}
      </div>

      {/* Visual representation */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
        <div className="flex justify-center items-center gap-4 flex-wrap">
          {selectedProgression.numerals.map((numeral, i) => (
            <div key={i} className="flex items-center gap-4">
              <motion.div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all ${
                  currentChordIndex === i
                    ? "bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/50"
                    : "bg-gray-700"
                }`}
                animate={{
                  scale: currentChordIndex === i ? 1.1 : 1,
                }}
              >
                {numeral}
              </motion.div>
              {i < selectedProgression.numerals.length - 1 && (
                <motion.span
                  className="text-2xl text-gray-500"
                  animate={{
                    opacity: currentChordIndex === i ? 1 : 0.5,
                    x: currentChordIndex === i ? 4 : 0,
                  }}
                >
                  →
                </motion.span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={playProgression}
            disabled={isPlaying}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {isPlaying ? "Playing..." : "Play Progression ▶"}
          </button>
        </div>
      </div>

      {/* Info panel */}
      <motion.div
        key={selectedProgression.name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold mb-2">{selectedProgression.name}</h3>
        <p className="text-gray-300 mb-4">{selectedProgression.description}</p>

        <div>
          <span className="text-gray-400 text-sm">Famous songs using this progression:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedProgression.songs.map((song) => (
              <span
                key={song}
                className="px-3 py-1 bg-gray-800 rounded-full text-sm"
              >
                {song}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
