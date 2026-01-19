"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ParsedNote } from "@/lib/midi/parser";
import { useSongStore } from "@/stores/songStore";
import { Badge } from "@/components/ui/badge";

interface FallingNotesProps {
  notes: ParsedNote[];
  currentTime: number;
  visibleDuration?: number;
  keyboardStartMidi?: number;
  keyboardEndMidi?: number;
}

const WHITE_KEY_WIDTH = 40;
const BLACK_KEY_WIDTH = 24;

const KEY_INFO: { [midi: number]: { isBlack: boolean; xOffset: number } } = {};

function initKeyInfo() {
  const whiteKeyPattern = [0, 2, 4, 5, 7, 9, 11];
  const blackKeyPattern = [1, 3, 6, 8, 10];

  let whiteKeyIndex = 0;

  for (let octave = 2; octave <= 6; octave++) {
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

export function FallingNotes({
  notes,
  currentTime,
  visibleDuration = 4,
  keyboardStartMidi = 36,
  keyboardEndMidi = 84,
}: FallingNotesProps) {
  const { showFingering } = useSongStore();

  const visibleNotes = useMemo(() => {
    return notes.filter((note) => {
      const noteEnd = note.time + note.duration;
      const windowStart = currentTime;
      const windowEnd = currentTime + visibleDuration;
      return noteEnd > windowStart && note.time < windowEnd;
    });
  }, [notes, currentTime, visibleDuration]);

  const keyboardWidth = useMemo(() => {
    let count = 0;
    for (let midi = keyboardStartMidi; midi <= keyboardEndMidi; midi++) {
      if (!KEY_INFO[midi]?.isBlack) count++;
    }
    return count * WHITE_KEY_WIDTH;
  }, [keyboardStartMidi, keyboardEndMidi]);

  const getKeyX = (midi: number): number => {
    const keyInfo = KEY_INFO[midi];
    const startKeyInfo = KEY_INFO[keyboardStartMidi];
    if (!keyInfo || !startKeyInfo) return 0;
    return keyInfo.xOffset - startKeyInfo.xOffset;
  };

  const containerHeight = 300;

  return (
    <div
      className="relative bg-background/80 border border-border rounded-t-2xl overflow-hidden"
      style={{ width: keyboardWidth, height: containerHeight }}
    >
      {/* Grid lines for measures */}
      <div className="absolute inset-0 pointer-events-none">
        {[0.25, 0.5, 0.75, 1].map((fraction) => (
          <div
            key={fraction}
            className="absolute w-full border-t border-border/50"
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

        const timeFromNow = note.time - currentTime;
        const normalizedY = 1 - timeFromNow / visibleDuration;
        const y = normalizedY * containerHeight;

        const noteHeight = Math.max(20, (note.duration / visibleDuration) * containerHeight);

        // Use gold colors - darker gold for left, lighter gold for right
        const isLeft = note.hand === "left";
        const baseColor = isLeft ? "bg-gold-dark" : "bg-gold";
        const activeColor = isLeft ? "bg-gold" : "bg-gold-light";

        const isActive = note.time <= currentTime && note.time + note.duration > currentTime;

        return (
          <motion.div
            key={`${note.midi}-${note.time}-${i}`}
            className={`absolute rounded-md ${isActive ? activeColor : baseColor} ${
              isActive ? "shadow-lg shadow-gold/40" : "shadow-sm shadow-gold/20"
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
            {showFingering && note.finger && (
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-black">
                {note.finger}
              </span>
            )}
          </motion.div>
        );
      })}

      {/* "Now" line at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />

      {/* Hand labels */}
      <div className="absolute top-3 left-3 flex gap-2">
        <Badge className="bg-gold-dark text-black text-xs font-bold px-2 py-0.5">
          L
        </Badge>
        <Badge className="bg-gold text-black text-xs font-bold px-2 py-0.5">
          R
        </Badge>
      </div>
    </div>
  );
}
