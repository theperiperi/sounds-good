"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Key } from "./Key";
import { generateNotes, KEYBOARD_START, KEYBOARD_END } from "@/lib/music/notes";
import { initAudio, playNote, releaseNote } from "@/lib/audio/synth";
import { initMidi, onMidiNote } from "@/lib/midi/input";
import { Note } from "@/types/music";

// Laptop keyboard to MIDI mapping
// White keys: A S D F G H J K L ; (C4 to E5)
// Black keys: W E   T Y U   O P
const KEYBOARD_MAP: Record<string, number> = {
  // White keys starting at C4 (MIDI 60)
  a: 60, // C4
  s: 62, // D4
  d: 64, // E4
  f: 65, // F4
  g: 67, // G4
  h: 69, // A4
  j: 71, // B4
  k: 72, // C5
  l: 74, // D5
  ";": 76, // E5
  // Black keys
  w: 61, // C#4
  e: 63, // D#4
  t: 66, // F#4
  y: 68, // G#4
  u: 70, // A#4
  o: 73, // C#5
  p: 75, // D#5
};

export interface HighlightedKey {
  midi: number;
  color?: string;
  finger?: number;
}

interface KeyboardProps {
  startOctave?: number;
  octaves?: number;
  highlightedNotes?: number[]; // Simple highlighting
  highlightedKeys?: HighlightedKey[]; // Rich highlighting with colors and fingers
  activeKeys?: number[]; // Externally controlled active keys
  wrongKeys?: number[]; // Keys that show as wrong
  showLabels?: boolean;
  onNotePlay?: (midi: number) => void;
  onNoteOn?: (midi: number) => void;
  onNoteOff?: (midi: number) => void;
  disableKeyboard?: boolean;
  disableMidi?: boolean;
}

export function Keyboard({
  startOctave = 2,
  octaves = 4,
  highlightedNotes = [],
  highlightedKeys = [],
  activeKeys: externalActiveKeys,
  wrongKeys = [],
  showLabels = true,
  onNotePlay,
  onNoteOn,
  onNoteOff,
  disableKeyboard = false,
  disableMidi = false,
}: KeyboardProps) {
  const [internalActiveKeys, setInternalActiveKeys] = useState<Set<number>>(new Set());
  const [audioReady, setAudioReady] = useState(false);

  // Use external active keys if provided, otherwise internal
  const activeKeys = externalActiveKeys
    ? new Set(externalActiveKeys)
    : internalActiveKeys;

  // Calculate MIDI range based on octaves
  const startMidi = (startOctave + 1) * 12; // +1 because MIDI octave 0 starts at MIDI 0
  const endMidi = startMidi + octaves * 12;

  // Generate notes for the specified range
  const allNotes = useMemo(
    () => generateNotes(startMidi, endMidi),
    [startMidi, endMidi]
  );
  const whiteNotes = allNotes.filter((n) => !n.isBlack);
  const blackNotes = allNotes.filter((n) => n.isBlack);

  // Create lookup for highlighted keys
  const highlightedKeyMap = useMemo(() => {
    const map = new Map<number, HighlightedKey>();
    highlightedKeys.forEach((k) => map.set(k.midi, k));
    return map;
  }, [highlightedKeys]);

  // Initialize audio on first interaction
  const ensureAudio = useCallback(async () => {
    if (!audioReady) {
      await initAudio();
      setAudioReady(true);
    }
  }, [audioReady]);

  const handleKeyPress = useCallback(
    async (midi: number) => {
      await ensureAudio();
      if (!externalActiveKeys) {
        setInternalActiveKeys((prev) => new Set(prev).add(midi));
      }
      playNote(midi);
      onNotePlay?.(midi);
      onNoteOn?.(midi);
    },
    [ensureAudio, onNotePlay, onNoteOn, externalActiveKeys]
  );

  const handleKeyRelease = useCallback(
    (midi: number) => {
      if (!externalActiveKeys) {
        setInternalActiveKeys((prev) => {
          const next = new Set(prev);
          next.delete(midi);
          return next;
        });
      }
      releaseNote(midi);
      onNoteOff?.(midi);
    },
    [onNoteOff, externalActiveKeys]
  );

  // Laptop keyboard input
  useEffect(() => {
    if (disableKeyboard) return;

    const pressedKeys = new Set<string>();

    const handleKeyDown = async (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (pressedKeys.has(key)) return; // Prevent repeat
      if (!(key in KEYBOARD_MAP)) return;

      pressedKeys.add(key);
      const midi = KEYBOARD_MAP[key];
      await handleKeyPress(midi);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      pressedKeys.delete(key);
      if (!(key in KEYBOARD_MAP)) return;

      const midi = KEYBOARD_MAP[key];
      handleKeyRelease(midi);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyPress, handleKeyRelease, disableKeyboard]);

  // MIDI keyboard input
  useEffect(() => {
    if (disableMidi) return;

    // Initialize MIDI
    initMidi();

    // Subscribe to MIDI note events
    const unsubscribe = onMidiNote(async (note, velocity, isNoteOn) => {
      if (isNoteOn) {
        await handleKeyPress(note);
      } else {
        handleKeyRelease(note);
      }
    });

    return unsubscribe;
  }, [handleKeyPress, handleKeyRelease, disableMidi]);

  // Calculate black key positions relative to white keys
  const getBlackKeyOffset = (note: Note) => {
    const noteInOctave = note.midi % 12;

    // Calculate which white key this black key follows
    const whiteKeysBeforeInOctave = [0, 2, 4, 5, 7, 9, 11].filter(
      (n) => n < noteInOctave
    ).length;
    const octaveOffset = Math.floor((note.midi - startMidi) / 12);
    const whiteKeysPerOctave = 7;
    const totalWhiteKeysBefore =
      octaveOffset * whiteKeysPerOctave + whiteKeysBeforeInOctave;

    return totalWhiteKeysBefore * 48; // 48px = white key width (w-12 = 3rem = 48px)
  };

  const isHighlighted = (midi: number) =>
    highlightedNotes.includes(midi) || highlightedKeyMap.has(midi);

  const getHighlightColor = (midi: number) =>
    highlightedKeyMap.get(midi)?.color;

  const getFinger = (midi: number) =>
    highlightedKeyMap.get(midi)?.finger;

  return (
    <div className="relative select-none">
      {/* White keys */}
      <div className="flex">
        {whiteNotes.map((note) => (
          <Key
            key={note.midi}
            note={note}
            isActive={activeKeys.has(note.midi)}
            isHighlighted={isHighlighted(note.midi)}
            highlightColor={getHighlightColor(note.midi)}
            isWrong={wrongKeys.includes(note.midi)}
            finger={getFinger(note.midi)}
            showLabel={showLabels}
            onPress={handleKeyPress}
            onRelease={handleKeyRelease}
          />
        ))}
      </div>

      {/* Black keys - positioned absolutely */}
      <div className="absolute top-0 left-0">
        {blackNotes.map((note) => (
          <div
            key={note.midi}
            className="absolute"
            style={{ left: `${getBlackKeyOffset(note)}px` }}
          >
            <Key
              note={note}
              isActive={activeKeys.has(note.midi)}
              isHighlighted={isHighlighted(note.midi)}
              highlightColor={getHighlightColor(note.midi)}
              isWrong={wrongKeys.includes(note.midi)}
              finger={getFinger(note.midi)}
              showLabel={showLabels}
              onPress={handleKeyPress}
              onRelease={handleKeyRelease}
            />
          </div>
        ))}
      </div>

      {/* Audio init indicator */}
      {!audioReady && (
        <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
          Click or press a key to enable sound
        </p>
      )}
    </div>
  );
}
