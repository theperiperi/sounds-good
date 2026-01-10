"use client";

import { create } from "zustand";
import { ParsedSong, ParsedNote, getSteps } from "@/lib/midi/parser";

export type HandMode = "left" | "right" | "both";
export type LearnMode = "watch" | "practice";

interface SongState {
  song: ParsedSong | null;
  handMode: HandMode;
  learnMode: LearnMode;
  currentStepIndex: number;
  steps: ParsedNote[][];
  isPlaying: boolean;
  tempo: number;  // Percentage of original tempo (100 = normal)
  showFingering: boolean;
  audioEnabled: boolean;

  // Actions
  setSong: (song: ParsedSong) => void;
  setHandMode: (mode: HandMode) => void;
  setLearnMode: (mode: LearnMode) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
  setIsPlaying: (playing: boolean) => void;
  setTempo: (tempo: number) => void;
  toggleFingering: () => void;
  toggleAudio: () => void;

  // Computed
  getCurrentStep: () => ParsedNote[] | null;
  getProgress: () => number;
  getFilteredNotes: () => ParsedNote[];
}

export const useSongStore = create<SongState>((set, get) => ({
  song: null,
  handMode: "both",
  learnMode: "practice",
  currentStepIndex: 0,
  steps: [],
  isPlaying: false,
  tempo: 100,
  showFingering: true,
  audioEnabled: true,

  setSong: (song) => {
    const notes = getFilteredNotesFromSong(song, get().handMode);
    const steps = getSteps(notes);
    set({ song, steps, currentStepIndex: 0 });
  },

  setHandMode: (handMode) => {
    const { song } = get();
    if (song) {
      const notes = getFilteredNotesFromSong(song, handMode);
      const steps = getSteps(notes);
      set({ handMode, steps, currentStepIndex: 0 });
    } else {
      set({ handMode });
    }
  },

  setLearnMode: (learnMode) => set({ learnMode }),

  nextStep: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  goToStep: (index) => {
    const { steps } = get();
    if (index >= 0 && index < steps.length) {
      set({ currentStepIndex: index });
    }
  },

  reset: () => set({ currentStepIndex: 0, isPlaying: false }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  setTempo: (tempo) => set({ tempo: Math.max(25, Math.min(150, tempo)) }),

  toggleFingering: () => set((state) => ({ showFingering: !state.showFingering })),

  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),

  getCurrentStep: () => {
    const { steps, currentStepIndex } = get();
    return steps[currentStepIndex] || null;
  },

  getProgress: () => {
    const { steps, currentStepIndex } = get();
    if (steps.length === 0) return 0;
    return (currentStepIndex / steps.length) * 100;
  },

  getFilteredNotes: () => {
    const { song, handMode } = get();
    if (!song) return [];
    return getFilteredNotesFromSong(song, handMode);
  },
}));

function getFilteredNotesFromSong(song: ParsedSong, handMode: HandMode): ParsedNote[] {
  if (handMode === "left") {
    return [...song.tracks.left].sort((a, b) => a.time - b.time);
  } else if (handMode === "right") {
    return [...song.tracks.right].sort((a, b) => a.time - b.time);
  }
  return [...song.tracks.all].sort((a, b) => a.time - b.time);
}
