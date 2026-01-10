"use client";

import { Midi } from "@tonejs/midi";

export interface ParsedNote {
  midi: number;
  name: string;
  time: number;        // Start time in seconds
  duration: number;    // Duration in seconds
  velocity: number;    // 0-1
  hand: "left" | "right";
  finger?: 1 | 2 | 3 | 4 | 5;
  measure: number;     // Which measure this note is in
}

export interface ParsedSong {
  name: string;
  duration: number;
  tempo: number;
  timeSignature: [number, number];
  measures: number;
  tracks: {
    left: ParsedNote[];
    right: ParsedNote[];
    all: ParsedNote[];
  };
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function midiToName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const note = NOTE_NAMES[midi % 12];
  return `${note}${octave}`;
}

/**
 * Parse a MIDI file and extract notes with hand assignments
 */
export async function parseMidiFile(file: File): Promise<ParsedSong> {
  const arrayBuffer = await file.arrayBuffer();
  const midi = new Midi(arrayBuffer);

  // Get tempo and time signature
  const tempo = midi.header.tempos[0]?.bpm || 120;
  const timeSig = midi.header.timeSignatures[0];
  const timeSignature: [number, number] = timeSig
    ? [timeSig.timeSignature[0], timeSig.timeSignature[1]]
    : [4, 4];

  // Calculate measure duration in seconds
  const beatsPerMeasure = timeSignature[0];
  const measureDuration = (60 / tempo) * beatsPerMeasure;

  // Collect all notes from all tracks
  const allNotes: ParsedNote[] = [];

  midi.tracks.forEach((track) => {
    track.notes.forEach((note) => {
      // Split by pitch: notes below middle C (60) = left hand
      const hand: "left" | "right" = note.midi < 60 ? "left" : "right";
      const measure = Math.floor(note.time / measureDuration);

      allNotes.push({
        midi: note.midi,
        name: midiToName(note.midi),
        time: note.time,
        duration: note.duration,
        velocity: note.velocity,
        hand,
        measure,
      });
    });
  });

  // Sort by time
  allNotes.sort((a, b) => a.time - b.time);

  // Split into hands
  const leftHand = allNotes.filter(n => n.hand === "left");
  const rightHand = allNotes.filter(n => n.hand === "right");

  // Calculate duration and measures
  const duration = Math.max(...allNotes.map(n => n.time + n.duration), 0);
  const measures = Math.ceil(duration / measureDuration);

  // Apply fingering suggestions
  assignFingering(leftHand, "left");
  assignFingering(rightHand, "right");

  return {
    name: file.name.replace(/\.(mid|midi)$/i, ""),
    duration,
    tempo,
    timeSignature,
    measures,
    tracks: {
      left: leftHand,
      right: rightHand,
      all: allNotes,
    },
  };
}

/**
 * Simple fingering algorithm based on intervals and hand position
 */
function assignFingering(notes: ParsedNote[], hand: "left" | "right"): void {
  if (notes.length === 0) return;

  // Group notes by approximate time (simultaneous notes = chord)
  const groups: ParsedNote[][] = [];
  let currentGroup: ParsedNote[] = [notes[0]];

  for (let i = 1; i < notes.length; i++) {
    // If notes are within 50ms, they're simultaneous (chord)
    if (notes[i].time - notes[i - 1].time < 0.05) {
      currentGroup.push(notes[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [notes[i]];
    }
  }
  groups.push(currentGroup);

  // Assign fingering to each group
  let lastFinger: 1 | 2 | 3 | 4 | 5 = hand === "right" ? 1 : 5;
  let lastMidi = notes[0].midi;

  groups.forEach((group) => {
    // Sort notes in chord by pitch
    group.sort((a, b) => a.midi - b.midi);

    if (group.length === 1) {
      // Single note - assign based on interval from last note
      const note = group[0];
      const interval = note.midi - lastMidi;

      const finger = calculateSingleNoteFinger(interval, lastFinger, hand);
      note.finger = finger;
      lastFinger = finger;
      lastMidi = note.midi;
    } else {
      // Chord - assign fingers based on position
      assignChordFingering(group, hand);
      // Update tracking with highest/lowest note depending on hand
      const referenceNote = hand === "right" ? group[group.length - 1] : group[0];
      lastFinger = (referenceNote.finger || lastFinger) as 1 | 2 | 3 | 4 | 5;
      lastMidi = referenceNote.midi;
    }
  });
}

function calculateSingleNoteFinger(
  interval: number,
  lastFinger: 1 | 2 | 3 | 4 | 5,
  hand: "left" | "right"
): 1 | 2 | 3 | 4 | 5 {
  const absInterval = Math.abs(interval);

  // If staying on same note, keep same finger
  if (interval === 0) return lastFinger;

  // Small intervals - use adjacent fingers
  if (absInterval <= 2) {
    if (hand === "right") {
      // Moving up = higher finger number
      if (interval > 0) {
        return Math.min(5, lastFinger + 1) as 1 | 2 | 3 | 4 | 5;
      } else {
        return Math.max(1, lastFinger - 1) as 1 | 2 | 3 | 4 | 5;
      }
    } else {
      // Left hand is reversed
      if (interval > 0) {
        return Math.max(1, lastFinger - 1) as 1 | 2 | 3 | 4 | 5;
      } else {
        return Math.min(5, lastFinger + 1) as 1 | 2 | 3 | 4 | 5;
      }
    }
  }

  // Medium intervals - might need finger crossing
  if (absInterval <= 4) {
    // Skip a finger
    if (hand === "right") {
      if (interval > 0 && lastFinger <= 3) {
        return Math.min(5, lastFinger + 2) as 1 | 2 | 3 | 4 | 5;
      } else if (interval < 0 && lastFinger >= 3) {
        return Math.max(1, lastFinger - 2) as 1 | 2 | 3 | 4 | 5;
      }
    } else {
      if (interval > 0 && lastFinger >= 3) {
        return Math.max(1, lastFinger - 2) as 1 | 2 | 3 | 4 | 5;
      } else if (interval < 0 && lastFinger <= 3) {
        return Math.min(5, lastFinger + 2) as 1 | 2 | 3 | 4 | 5;
      }
    }
  }

  // Large intervals - hand position shift, reset to comfortable finger
  if (absInterval >= 5) {
    // Start fresh with thumb or pinky depending on direction
    if (hand === "right") {
      return interval > 0 ? 1 : 5;
    } else {
      return interval > 0 ? 5 : 1;
    }
  }

  // Default to middle finger for stability
  return 3;
}

function assignChordFingering(notes: ParsedNote[], hand: "left" | "right"): void {
  const count = notes.length;

  // Common chord fingerings
  if (count === 2) {
    // Interval of a third or less: 1-3 or 2-4
    // Larger: 1-5
    const interval = notes[1].midi - notes[0].midi;
    if (interval <= 4) {
      if (hand === "right") {
        notes[0].finger = 1;
        notes[1].finger = 3;
      } else {
        notes[0].finger = 3;
        notes[1].finger = 1;
      }
    } else {
      if (hand === "right") {
        notes[0].finger = 1;
        notes[1].finger = 5;
      } else {
        notes[0].finger = 5;
        notes[1].finger = 1;
      }
    }
  } else if (count === 3) {
    // Standard triad fingering
    if (hand === "right") {
      notes[0].finger = 1;
      notes[1].finger = 3;
      notes[2].finger = 5;
    } else {
      notes[0].finger = 5;
      notes[1].finger = 3;
      notes[2].finger = 1;
    }
  } else if (count === 4) {
    // 4-note chord
    if (hand === "right") {
      notes[0].finger = 1;
      notes[1].finger = 2;
      notes[2].finger = 3;
      notes[3].finger = 5;
    } else {
      notes[0].finger = 5;
      notes[1].finger = 3;
      notes[2].finger = 2;
      notes[3].finger = 1;
    }
  } else {
    // 5+ notes - use all fingers
    const fingers: (1 | 2 | 3 | 4 | 5)[] = hand === "right"
      ? [1, 2, 3, 4, 5]
      : [5, 4, 3, 2, 1];
    notes.forEach((note, i) => {
      note.finger = fingers[Math.min(i, 4)] as 1 | 2 | 3 | 4 | 5;
    });
  }
}

/**
 * Get notes for a specific measure
 */
export function getNotesForMeasure(song: ParsedSong, measure: number, hand?: "left" | "right" | "both"): ParsedNote[] {
  let notes = song.tracks.all.filter(n => n.measure === measure);

  if (hand === "left") {
    notes = notes.filter(n => n.hand === "left");
  } else if (hand === "right") {
    notes = notes.filter(n => n.hand === "right");
  }

  return notes.sort((a, b) => a.time - b.time);
}

/**
 * Group notes into steps (notes that should be played together)
 */
export function getSteps(notes: ParsedNote[]): ParsedNote[][] {
  if (notes.length === 0) return [];

  const steps: ParsedNote[][] = [];
  let currentStep: ParsedNote[] = [notes[0]];

  for (let i = 1; i < notes.length; i++) {
    // Notes within 50ms are considered simultaneous
    if (notes[i].time - currentStep[0].time < 0.05) {
      currentStep.push(notes[i]);
    } else {
      steps.push(currentStep);
      currentStep = [notes[i]];
    }
  }
  steps.push(currentStep);

  return steps;
}
