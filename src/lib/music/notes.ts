import { Note } from "@/types/music";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BLACK_KEYS = new Set([1, 3, 6, 8, 10]); // Semitone positions that are black

/**
 * Convert MIDI number to note name (e.g., 60 -> "C4")
 */
export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Convert note name to MIDI number (e.g., "C4" -> 60)
 */
export function noteNameToMidi(name: string): number {
  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) throw new Error(`Invalid note name: ${name}`);

  const [, notePart, octavePart] = match;
  const noteIndex = NOTE_NAMES.indexOf(notePart);
  if (noteIndex === -1) throw new Error(`Invalid note: ${notePart}`);

  const octave = parseInt(octavePart, 10);
  return (octave + 1) * 12 + noteIndex;
}

/**
 * Check if a MIDI note is a black key
 */
export function isBlackKey(midi: number): boolean {
  return BLACK_KEYS.has(midi % 12);
}

/**
 * Get the octave number from MIDI
 */
export function getOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

/**
 * Create a Note object from MIDI number
 */
export function createNote(midi: number): Note {
  return {
    midi,
    name: midiToNoteName(midi),
    octave: getOctave(midi),
    isBlack: isBlackKey(midi),
  };
}

/**
 * Generate all notes for a given MIDI range
 */
export function generateNotes(startMidi: number, endMidi: number): Note[] {
  const notes: Note[] = [];
  for (let midi = startMidi; midi <= endMidi; midi++) {
    notes.push(createNote(midi));
  }
  return notes;
}

/**
 * MIDI note for middle C
 */
export const MIDDLE_C = 60;

/**
 * 49-key keyboard range (C2 to C6)
 */
export const KEYBOARD_START = 36; // C2
export const KEYBOARD_END = 84;   // C6
