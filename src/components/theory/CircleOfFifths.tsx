"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { playNoteForDuration, initAudio } from "@/lib/audio/synth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

interface KeyInfo {
  major: string;
  minor: string;
  sharps: number;
  flats: number;
  notes: string[];
  midi: number; // Root note MIDI
}

const KEYS: KeyInfo[] = [
  { major: "C", minor: "Am", sharps: 0, flats: 0, notes: ["C", "D", "E", "F", "G", "A", "B"], midi: 60 },
  { major: "G", minor: "Em", sharps: 1, flats: 0, notes: ["G", "A", "B", "C", "D", "E", "F#"], midi: 67 },
  { major: "D", minor: "Bm", sharps: 2, flats: 0, notes: ["D", "E", "F#", "G", "A", "B", "C#"], midi: 62 },
  { major: "A", minor: "F#m", sharps: 3, flats: 0, notes: ["A", "B", "C#", "D", "E", "F#", "G#"], midi: 69 },
  { major: "E", minor: "C#m", sharps: 4, flats: 0, notes: ["E", "F#", "G#", "A", "B", "C#", "D#"], midi: 64 },
  { major: "B", minor: "G#m", sharps: 5, flats: 0, notes: ["B", "C#", "D#", "E", "F#", "G#", "A#"], midi: 71 },
  { major: "F#", minor: "D#m", sharps: 6, flats: 0, notes: ["F#", "G#", "A#", "B", "C#", "D#", "E#"], midi: 66 },
  { major: "Db", minor: "Bbm", sharps: 0, flats: 5, notes: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"], midi: 61 },
  { major: "Ab", minor: "Fm", sharps: 0, flats: 4, notes: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"], midi: 68 },
  { major: "Eb", minor: "Cm", sharps: 0, flats: 3, notes: ["Eb", "F", "G", "Ab", "Bb", "C", "D"], midi: 63 },
  { major: "Bb", minor: "Gm", sharps: 0, flats: 2, notes: ["Bb", "C", "D", "Eb", "F", "G", "A"], midi: 70 },
  { major: "F", minor: "Dm", sharps: 0, flats: 1, notes: ["F", "G", "A", "Bb", "C", "D", "E"], midi: 65 },
];

// Map note names to semitone values (C=0)
const NOTE_TO_SEMITONE: Record<string, number> = {
  "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3,
  "E": 4, "E#": 5, "Fb": 4, "F": 5, "F#": 6, "Gb": 6,
  "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10,
  "B": 11, "B#": 0, "Cb": 11,
};

export function CircleOfFifths() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingNote, setPlayingNote] = useState<number | null>(null);

  const selectedKey = KEYS[selectedIndex];

  // Get semitones in the scale
  const scaleNotes = selectedKey.notes.map((n) => NOTE_TO_SEMITONE[n]);

  const playScale = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    await initAudio();

    const intervals = [0, 2, 4, 5, 7, 9, 11, 12];
    intervals.forEach((interval, i) => {
      setTimeout(() => {
        const noteMidi = selectedKey.midi + interval;
        setPlayingNote(interval % 12);
        playNoteForDuration(noteMidi, 0.3);
        if (i === intervals.length - 1) {
          setTimeout(() => {
            setIsPlaying(false);
            setPlayingNote(null);
          }, 400);
        }
      }, i * 250);
    });
  }, [selectedKey, isPlaying]);

  // Calculate positions for the circle
  const getPosition = (index: number, radius: number) => {
    const angle = (index * 30 - 90) * (Math.PI / 180);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  // Render one octave keyboard
  const renderKeyboard = () => {
    const whiteKeys = [
      { semitone: 0, name: "C" },
      { semitone: 2, name: "D" },
      { semitone: 4, name: "E" },
      { semitone: 5, name: "F" },
      { semitone: 7, name: "G" },
      { semitone: 9, name: "A" },
      { semitone: 11, name: "B" },
    ];
    const blackKeys = [
      { semitone: 1, position: 1, name: "C#" },
      { semitone: 3, position: 2, name: "D#" },
      { semitone: 6, position: 4, name: "F#" },
      { semitone: 8, position: 5, name: "G#" },
      { semitone: 10, position: 6, name: "A#" },
    ];

    return (
      <div className="relative inline-flex">
        {/* White keys */}
        {whiteKeys.map(({ semitone, name }, i) => {
          const isInScale = scaleNotes.includes(semitone);
          const isRoot = semitone === NOTE_TO_SEMITONE[selectedKey.major] ||
                         semitone === NOTE_TO_SEMITONE[selectedKey.major.replace("#", "").replace("b", "")];
          const isCurrentlyPlaying = playingNote === semitone;

          return (
            <motion.div
              key={semitone}
              className={`relative w-10 h-28 rounded-b-lg border-x border-b flex flex-col items-center justify-end pb-2 transition-all duration-100 ${
                isCurrentlyPlaying
                  ? "bg-gold-light border-gold text-black shadow-glow-gold"
                  : isInScale
                  ? isRoot
                    ? "bg-gold border-gold-dark text-black"
                    : "bg-gold-light border-gold text-black"
                  : "bg-gray-200 border-gray-300 text-gray-400"
              }`}
              animate={{ y: isCurrentlyPlaying ? 2 : 0 }}
            >
              <span className="text-xs font-medium">{name}</span>
            </motion.div>
          );
        })}

        {/* Black keys */}
        {blackKeys.map(({ semitone, position, name }) => {
          const isInScale = scaleNotes.includes(semitone);
          const isCurrentlyPlaying = playingNote === semitone;

          return (
            <motion.div
              key={semitone}
              className={`absolute top-0 w-6 h-16 rounded-b-lg z-10 transition-all duration-100 ${
                isCurrentlyPlaying
                  ? "bg-gold shadow-glow-gold"
                  : isInScale
                  ? "bg-gold"
                  : "bg-gray-500"
              }`}
              style={{ left: position * 40 - 13 }}
              animate={{ y: isCurrentlyPlaying ? 2 : 0 }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row items-center gap-8 justify-center">
        {/* The wheel - static, no rotation */}
        <div className="relative" style={{ width: 380, height: 380 }}>
          {/* Decorative circles */}
          <svg className="absolute inset-0 w-full h-full" viewBox="-190 -190 380 380">
            <circle cx="0" cy="0" r="170" fill="none" stroke="rgb(55 65 81)" strokeWidth="1" />
            <circle cx="0" cy="0" r="115" fill="none" stroke="rgb(55 65 81)" strokeWidth="1" />
            <circle cx="0" cy="0" r="50" fill="rgb(31 41 55)" stroke="rgb(55 65 81)" strokeWidth="2" />

            {/* Connection lines from selected to neighbors */}
            {selectedIndex !== null && (
              <>
                <line
                  x1={getPosition(selectedIndex, 145).x}
                  y1={getPosition(selectedIndex, 145).y}
                  x2={getPosition((selectedIndex + 1) % 12, 145).x}
                  y2={getPosition((selectedIndex + 1) % 12, 145).y}
                  stroke="#d4a853"
                  strokeWidth="2"
                  opacity="0.3"
                />
                <line
                  x1={getPosition(selectedIndex, 145).x}
                  y1={getPosition(selectedIndex, 145).y}
                  x2={getPosition((selectedIndex + 11) % 12, 145).x}
                  y2={getPosition((selectedIndex + 11) % 12, 145).y}
                  stroke="#d4a853"
                  strokeWidth="2"
                  opacity="0.3"
                />
              </>
            )}
          </svg>

          {/* Major keys - outer ring */}
          {KEYS.map((key, index) => {
            const pos = getPosition(index, 145);
            const isSelected = selectedIndex === index;
            const isAdjacent =
              index === (selectedIndex + 1) % 12 ||
              index === (selectedIndex + 11) % 12;

            return (
              <motion.button
                key={key.major}
                className={`absolute w-14 h-14 rounded-full font-bold text-sm flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-gold text-black shadow-lg shadow-gold/50"
                    : isAdjacent
                    ? "bg-gold/30 text-foreground border-2 border-gold/50"
                    : "bg-secondary hover:bg-secondary/80 text-foreground"
                }`}
                style={{
                  left: `calc(50% + ${pos.x}px - 28px)`,
                  top: `calc(50% + ${pos.y}px - 28px)`,
                }}
                onClick={() => setSelectedIndex(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {key.major}
              </motion.button>
            );
          })}

          {/* Minor keys - inner ring */}
          {KEYS.map((key, index) => {
            const pos = getPosition(index, 90);
            const isSelected = selectedIndex === index;

            return (
              <motion.button
                key={key.minor}
                className={`absolute w-11 h-11 rounded-full font-medium text-xs flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-gold-dark text-black"
                    : "bg-card hover:bg-card/80 text-muted-foreground border border-border"
                }`}
                style={{
                  left: `calc(50% + ${pos.x}px - 22px)`,
                  top: `calc(50% + ${pos.y}px - 22px)`,
                }}
                onClick={() => setSelectedIndex(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {key.minor}
              </motion.button>
            );
          })}

          {/* Center display */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Selected</div>
              <div className="text-2xl font-bold text-gold">{selectedKey.major}</div>
            </div>
          </div>
        </div>

        {/* Info panel */}
        <motion.div
          key={selectedIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-card/80 border-border w-full max-w-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center text-3xl font-bold text-black">
                  {selectedKey.major}
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-serif">{selectedKey.major} Major</h3>
                  <p className="text-muted-foreground">Relative: {selectedKey.minor}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Key signature */}
                <div className="bg-background/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-2">Key Signature</div>
                  <div className="flex items-center gap-2">
                    {selectedKey.sharps > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {["F", "C", "G", "D", "A", "E", "B"].slice(0, selectedKey.sharps).map((n) => (
                          <Badge key={n} variant="outline" className="bg-gold/20 text-gold border-gold/30">
                            {n}#
                          </Badge>
                        ))}
                      </div>
                    ) : selectedKey.flats > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {["B", "E", "A", "D", "G", "C", "F"].slice(0, selectedKey.flats).map((n) => (
                          <Badge key={n} variant="outline" className="bg-gold-dark/20 text-gold-dark border-gold-dark/30">
                            {n}b
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No sharps or flats</span>
                    )}
                  </div>
                </div>

                {/* Scale notes */}
                <div className="bg-background/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-2">Scale Notes</div>
                  <div className="flex gap-1 flex-wrap">
                    {selectedKey.notes.map((note, i) => (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          i === 0 ? "bg-gold text-black" : "bg-secondary"
                        }`}
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Related keys */}
                <div className="bg-background/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-2">Related Keys</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Fourth</div>
                      <div className="font-medium">{KEYS[(selectedIndex + 11) % 12].major}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Fifth</div>
                      <div className="font-medium">{KEYS[(selectedIndex + 1) % 12].major}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Relative</div>
                      <div className="font-medium">{selectedKey.minor}</div>
                    </div>
                  </div>
                </div>

                {/* Play button */}
                <Button
                  onClick={playScale}
                  disabled={isPlaying}
                  className={`w-full ${isPlaying ? "bg-gold-dark text-white" : "gradient-gold text-black hover:opacity-90"}`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isPlaying ? "Playing..." : `Play ${selectedKey.major} Major Scale`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Keyboard visualization */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold font-serif mb-4 text-center">{selectedKey.major} Major Scale on Keyboard</h3>
          <div className="flex justify-center">
            {renderKeyboard()}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gold" />
              <span className="text-muted-foreground">Root</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gold-light" />
              <span className="text-muted-foreground">Scale tones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gold-light shadow-glow-gold" />
              <span className="text-muted-foreground">Playing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Educational content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-5">
            <h4 className="font-bold font-serif mb-2">Moving Around the Circle</h4>
            <p className="text-muted-foreground text-sm">
              Moving clockwise (C → G → D) adds one sharp each time. Moving counter-clockwise
              (C → F → Bb) adds one flat. Adjacent keys share 6 of their 7 notes, making
              them harmonically related.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-5">
            <h4 className="font-bold font-serif mb-2">Relative Major/Minor</h4>
            <p className="text-muted-foreground text-sm">
              The inner circle shows relative minor keys. A minor and C major share the same notes
              but start on different roots. The relative minor is always 3 semitones below the major.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
