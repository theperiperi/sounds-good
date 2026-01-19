"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { playNoteForDuration, initAudio } from "@/lib/audio/synth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

// MIDI to note name mapping
const MIDI_TO_NOTE: Record<number, string> = {
  60: "C", 61: "C#", 62: "D", 63: "D#", 64: "E", 65: "F",
  66: "F#", 67: "G", 68: "G#", 69: "A", 70: "A#", 71: "B",
  72: "C", 73: "C#", 74: "D", 75: "D#", 76: "E"
};

interface Progression {
  name: string;
  numerals: string[];
  chords: number[][];
  description: string;
  songs: string[];
}

const PROGRESSIONS: Progression[] = [
  {
    name: "I - IV - V - I",
    numerals: ["I", "IV", "V", "I"],
    chords: [
      [60, 64, 67],
      [65, 69, 72],
      [67, 71, 74],
      [60, 64, 67],
    ],
    description: "The foundation of Western music. Strong, resolved, classic.",
    songs: ["Twist and Shout", "La Bamba", "Wild Thing"],
  },
  {
    name: "I - V - vi - IV",
    numerals: ["I", "V", "vi", "IV"],
    chords: [
      [60, 64, 67],
      [67, 71, 74],
      [69, 72, 76],
      [65, 69, 72],
    ],
    description: "The 'pop' progression. Emotional, familiar, powerful.",
    songs: ["Let It Be", "No Woman No Cry", "With or Without You"],
  },
  {
    name: "vi - IV - I - V",
    numerals: ["vi", "IV", "I", "V"],
    chords: [
      [69, 72, 76],
      [65, 69, 72],
      [60, 64, 67],
      [67, 71, 74],
    ],
    description: "Emotional minor start. Builds hope.",
    songs: ["Despacito", "Africa", "Zombie"],
  },
  {
    name: "ii - V - I",
    numerals: ["ii", "V", "I"],
    chords: [
      [62, 65, 69],
      [67, 71, 74],
      [60, 64, 67],
    ],
    description: "The essential jazz progression. Smooth resolution.",
    songs: ["Autumn Leaves", "Fly Me to the Moon", "All of Me"],
  },
  {
    name: "I - vi - IV - V",
    numerals: ["I", "vi", "IV", "V"],
    chords: [
      [60, 64, 67],
      [69, 72, 76],
      [65, 69, 72],
      [67, 71, 74],
    ],
    description: "50s doo-wop progression. Nostalgic, romantic.",
    songs: ["Stand By Me", "Every Breath You Take", "Unchained Melody"],
  },
  {
    name: "I - IV - vi - V",
    numerals: ["I", "IV", "vi", "V"],
    chords: [
      [60, 64, 67],
      [65, 69, 72],
      [69, 72, 76],
      [67, 71, 74],
    ],
    description: "Hopeful and uplifting. Common in anthems.",
    songs: ["Hey Ya!", "Take On Me", "What Makes You Beautiful"],
  },
];

export function ChordProgressionPlayer() {
  const [selectedProgression, setSelectedProgression] = useState(PROGRESSIONS[1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState<number | null>(null);

  // Get current chord notes (normalized to single octave for display)
  const currentChordNotes = useMemo(() => {
    if (currentChordIndex === null) return new Set<number>();
    const chord = selectedProgression.chords[currentChordIndex];
    // Normalize to 60-71 range for keyboard display
    return new Set(chord.map(note => ((note - 60) % 12) + 60));
  }, [currentChordIndex, selectedProgression]);

  // Get selected chord notes (when not playing, show first chord)
  const displayChordNotes = useMemo(() => {
    const chordIdx = currentChordIndex ?? 0;
    const chord = selectedProgression.chords[chordIdx];
    return new Set(chord.map(note => ((note - 60) % 12) + 60));
  }, [currentChordIndex, selectedProgression]);

  // Render a mini keyboard visualization
  const renderKeyboard = () => {
    const whiteKeys = [
      { semitone: 60, name: "C" },
      { semitone: 62, name: "D" },
      { semitone: 64, name: "E" },
      { semitone: 65, name: "F" },
      { semitone: 67, name: "G" },
      { semitone: 69, name: "A" },
      { semitone: 71, name: "B" },
    ];
    const blackKeys = [
      { semitone: 61, position: 1 },
      { semitone: 63, position: 2 },
      { semitone: 66, position: 4 },
      { semitone: 68, position: 5 },
      { semitone: 70, position: 6 },
    ];

    const notesToShow = isPlaying ? currentChordNotes : displayChordNotes;

    return (
      <div className="relative inline-flex">
        {/* White keys */}
        {whiteKeys.map(({ semitone, name }) => {
          const isActive = notesToShow.has(semitone);
          return (
            <motion.div
              key={semitone}
              className={`relative w-10 h-24 rounded-b-lg border-x border-b flex flex-col items-center justify-end pb-2 transition-all duration-100 ${
                isActive
                  ? "bg-gold border-gold-dark text-black shadow-glow-gold"
                  : "bg-gray-200 border-gray-300 text-gray-400"
              }`}
              animate={{
                y: isActive && isPlaying ? 2 : 0,
                scale: isActive && isPlaying ? 1.02 : 1
              }}
              transition={{ duration: 0.1 }}
            >
              <span className="text-xs font-medium">{name}</span>
            </motion.div>
          );
        })}

        {/* Black keys */}
        {blackKeys.map(({ semitone, position }) => {
          const isActive = notesToShow.has(semitone);
          return (
            <motion.div
              key={semitone}
              className={`absolute top-0 w-6 h-14 rounded-b-lg z-10 transition-all duration-100 ${
                isActive
                  ? "bg-gold shadow-glow-gold"
                  : "bg-gray-600"
              }`}
              style={{ left: position * 40 - 13 }}
              animate={{
                y: isActive && isPlaying ? 2 : 0
              }}
              transition={{ duration: 0.1 }}
            />
          );
        })}
      </div>
    );
  };

  const playProgression = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    await initAudio();

    const chords = selectedProgression.chords;
    const duration = 800;

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
                ? "gradient-gold text-black shadow-lg"
                : "bg-secondary hover:bg-secondary/80"
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
      <Card className="bg-card/50 border-border">
        <CardContent className="p-8">
          {/* Chord numerals */}
          <div className="flex justify-center items-center gap-4 flex-wrap mb-8">
            {selectedProgression.numerals.map((numeral, i) => (
              <div key={i} className="flex items-center gap-4">
                <motion.div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold font-serif transition-all ${
                    currentChordIndex === i
                      ? "gradient-gold text-black scale-110 shadow-glow-gold"
                      : (currentChordIndex === null && i === 0)
                      ? "bg-gold/20 border-2 border-gold/50"
                      : "bg-secondary"
                  }`}
                  animate={{
                    scale: currentChordIndex === i ? 1.1 : 1,
                  }}
                >
                  {numeral}
                </motion.div>
                {i < selectedProgression.numerals.length - 1 && (
                  <motion.span
                    className="text-xl text-muted-foreground"
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

          {/* Keyboard visualization */}
          <div className="flex justify-center mb-6">
            {renderKeyboard()}
          </div>

          {/* Chord notes label */}
          <div className="text-center mb-6">
            <span className="text-sm text-muted-foreground">
              {currentChordIndex !== null
                ? `Playing: ${selectedProgression.numerals[currentChordIndex]}`
                : `${selectedProgression.numerals[0]} chord`
              }
            </span>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={playProgression}
              disabled={isPlaying}
              className="gradient-gold text-black hover:opacity-90"
            >
              <Play className="w-4 h-4 mr-2" />
              {isPlaying ? "Playing..." : "Play Progression"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info panel */}
      <motion.div
        key={selectedProgression.name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-gold/20 to-gold-dark/20 border-gold/30">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold font-serif mb-2">{selectedProgression.name}</h3>
            <p className="text-muted-foreground mb-4">{selectedProgression.description}</p>

            <div>
              <span className="text-muted-foreground text-sm">Famous songs using this progression:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedProgression.songs.map((song) => (
                  <Badge
                    key={song}
                    variant="outline"
                    className="border-gold/30 bg-gold/10"
                  >
                    {song}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
