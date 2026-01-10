"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ParsedNote } from "@/lib/midi/parser";
import { useSongStore } from "@/stores/songStore";

interface FallingNotesProps {
  notes: ParsedNote[];
  currentTime: number;
  visibleDuration?: number; // How many seconds to show ahead
  keyboardStartMidi?: number;
  keyboardEndMidi?: number;
}

// Key width in pixels
const WHITE_KEY_WIDTH = 40;
const BLACK_KEY_WIDTH = 24;

// Piano key layout
const KEY_INFO: { [midi: number]: { isBlack: boolean; xOffset: number } } = {};

// Pre-calculate key positions for 4 octaves (C2 to C6 = MIDI 36-84)
function initKeyInfo() {
  const whiteKeyPattern = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B
  const blackKeyPattern = [1, 3, 6, 8, 10]; // C# D# F# G# A#

  let whiteKeyIndex = 0;

  for (let octave = 2; octave <= 6; octave++) {
    const baseNote = octave * 12;

    for (let i = 0; i < 12; i++) {
      const midi = baseNote + i;
      const isBlack = blackKeyPattern.includes(i);

      if (isBlack) {
        // Black key - position based on preceding white key
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

export function FallingNotes({
  notes,
  currentTime,
  visibleDuration = 4,
  keyboardStartMidi = 36,
  keyboardEndMidi = 84,
}: FallingNotesProps) {
  const { showFingering } = useSongStore();

  // Filter notes that are visible in the current time window
  const visibleNotes = useMemo(() => {
    return notes.filter((note) => {
      const noteEnd = note.time + note.duration;
      const windowStart = currentTime;
      const windowEnd = currentTime + visibleDuration;

      // Note is visible if it overlaps with the visible window
      return noteEnd > windowStart && note.time < windowEnd;
    });
  }, [notes, currentTime, visibleDuration]);

  // Calculate the total width based on white keys in range
  const keyboardWidth = useMemo(() => {
    let count = 0;
    for (let midi = keyboardStartMidi; midi <= keyboardEndMidi; midi++) {
      if (!KEY_INFO[midi]?.isBlack) count++;
    }
    return count * WHITE_KEY_WIDTH;
  }, [keyboardStartMidi, keyboardEndMidi]);

  // Get x offset relative to keyboard start
  const getKeyX = (midi: number): number => {
    const keyInfo = KEY_INFO[midi];
    const startKeyInfo = KEY_INFO[keyboardStartMidi];
    if (!keyInfo || !startKeyInfo) return 0;
    return keyInfo.xOffset - startKeyInfo.xOffset;
  };

  const containerHeight = 300;

  return (
    <div
      className="relative bg-gray-900/80 rounded-t-2xl overflow-hidden"
      style={{ width: keyboardWidth, height: containerHeight }}
    >
      {/* Grid lines for measures */}
      <div className="absolute inset-0 pointer-events-none">
        {[0.25, 0.5, 0.75, 1].map((fraction) => (
          <div
            key={fraction}
            className="absolute w-full border-t border-gray-700/50"
            style={{ top: `${fraction * 100}%` }}
          />
        ))}
      </div>

      {/* Falling notes */}
      {visibleNotes.map((note, i) => {
        const keyInfo = KEY_INFO[note.midi];
        if (!keyInfo) return null;

        const x = getKeyX(note.midi);
        const width = keyInfo.isBlack ? BLACK_KEY_WIDTH - 4 : WHITE_KEY_WIDTH - 4;

        // Calculate Y position (0 = top = future, height = bottom = current time)
        const timeFromNow = note.time - currentTime;
        const normalizedY = 1 - timeFromNow / visibleDuration;
        const y = normalizedY * containerHeight;

        // Note height based on duration
        const noteHeight = Math.max(20, (note.duration / visibleDuration) * containerHeight);

        // Color based on hand
        const color = note.hand === "left" ? "bg-blue-500" : "bg-indigo-500";
        const activeColor = note.hand === "left" ? "bg-blue-400" : "bg-indigo-400";

        // Is this note currently being played (at the "now" line)?
        const isActive = note.time <= currentTime && note.time + note.duration > currentTime;

        return (
          <motion.div
            key={`${note.midi}-${note.time}-${i}`}
            className={`absolute rounded-sm ${isActive ? activeColor : color} ${
              isActive ? "shadow-lg shadow-indigo-500/50" : ""
            }`}
            style={{
              left: x + 2,
              width,
              height: noteHeight,
              bottom: containerHeight - y,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {/* Finger number */}
            {showFingering && note.finger && (
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-white/90">
                {note.finger}
              </span>
            )}
          </motion.div>
        );
      })}

      {/* "Now" line at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Hand labels */}
      <div className="absolute top-2 left-2 flex gap-2 text-xs">
        <span className="px-2 py-1 bg-blue-500/80 rounded">L</span>
        <span className="px-2 py-1 bg-indigo-500/80 rounded">R</span>
      </div>
    </div>
  );
}
