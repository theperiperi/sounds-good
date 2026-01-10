"use client";

import { create } from "zustand";

export interface SheetNote {
  id: string;
  midi: number;
  beat: number; // Which beat in the measure (0-indexed)
  measure: number;
  duration: number; // In beats (1 = quarter, 0.5 = eighth, etc.)
}

export interface ComposerState {
  notes: SheetNote[];
  timeSignature: [number, number]; // [beats per measure, beat value]
  keySignature: number; // Number of sharps (positive) or flats (negative)
  tempo: number;
  measures: number;
  selectedDuration: number;
  isPlaying: boolean;
  currentPlaybackBeat: number | null;

  // Actions
  addNote: (midi: number, beat: number, measure: number) => void;
  removeNote: (id: string) => void;
  clearNotes: () => void;
  setTimeSignature: (ts: [number, number]) => void;
  setKeySignature: (ks: number) => void;
  setTempo: (tempo: number) => void;
  setMeasures: (measures: number) => void;
  setSelectedDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentPlaybackBeat: (beat: number | null) => void;
  loadNotes: (notes: SheetNote[]) => void;
}

let noteIdCounter = 0;

export const useComposerStore = create<ComposerState>((set, get) => ({
  notes: [],
  timeSignature: [4, 4],
  keySignature: 0,
  tempo: 120,
  measures: 4,
  selectedDuration: 1, // Quarter note
  isPlaying: false,
  currentPlaybackBeat: null,

  addNote: (midi, beat, measure) => {
    const id = `note-${noteIdCounter++}`;
    const duration = get().selectedDuration;
    set((state) => ({
      notes: [...state.notes, { id, midi, beat, measure, duration }],
    }));
  },

  removeNote: (id) => {
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    }));
  },

  clearNotes: () => set({ notes: [] }),

  setTimeSignature: (timeSignature) => set({ timeSignature }),
  setKeySignature: (keySignature) => set({ keySignature }),
  setTempo: (tempo) => set({ tempo: Math.max(40, Math.min(200, tempo)) }),
  setMeasures: (measures) => set({ measures: Math.max(1, Math.min(32, measures)) }),
  setSelectedDuration: (selectedDuration) => set({ selectedDuration }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentPlaybackBeat: (currentPlaybackBeat) => set({ currentPlaybackBeat }),
  loadNotes: (notes) => set({ notes }),
}));
