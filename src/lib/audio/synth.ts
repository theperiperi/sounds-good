"use client";

import * as Tone from "tone";
import { midiToNoteName } from "@/lib/music/notes";

let synth: Tone.PolySynth | null = null;
let isInitialized = false;

/**
 * Initialize the audio context and synth
 * Must be called after a user gesture (click, keypress)
 */
export async function initAudio(): Promise<void> {
  if (isInitialized) return;

  await Tone.start();

  // Add subtle compression for consistent dynamics
  const compressor = new Tone.Compressor({
    threshold: -20,
    ratio: 3,
    attack: 0.01,
    release: 0.1,
  });

  // Add EQ for brightness
  const eq = new Tone.EQ3({
    low: 0,              // Neutral lows
    mid: 0,
    high: 3,             // Boost highs for clarity
    lowFrequency: 250,
    highFrequency: 3000,
  });

  // Add a small room reverb for natural space
  const reverb = new Tone.Reverb({
    decay: 1.0,
    wet: 0.15,           // Subtle reverb
  }).toDestination();

  // Wait for reverb to be ready
  await reverb.ready;

  // Create a bright, clear piano-like sound
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "fatsine",    // Sine with slight detuning for richness
      count: 3,           // 3 oscillators layered
      spread: 15,         // Slight detune spread for width
    },
    envelope: {
      attack: 0.005,      // Very fast attack for crisp response
      decay: 0.3,         // Moderate decay
      sustain: 0.2,       // Lower sustain for clarity
      release: 1.2,       // Natural release tail
    },
  });

  // Set volume
  synth.volume.value = -6;

  // Signal chain: synth -> compressor -> eq -> reverb -> output
  synth.chain(compressor, eq, reverb);

  isInitialized = true;
}

/**
 * Play a note by MIDI number
 */
export function playNote(midi: number, velocity: number = 0.7): void {
  if (!synth) {
    console.warn("Audio not initialized. Call initAudio() first.");
    return;
  }

  const noteName = midiToNoteName(midi);
  synth.triggerAttack(noteName, Tone.now(), velocity);
}

/**
 * Release a note by MIDI number
 */
export function releaseNote(midi: number): void {
  if (!synth) return;

  const noteName = midiToNoteName(midi);
  synth.triggerRelease(noteName, Tone.now());
}

/**
 * Play a note for a specific duration
 */
export function playNoteForDuration(
  midi: number,
  duration: number = 0.5,
  velocity: number = 0.7
): void {
  if (!synth) {
    console.warn("Audio not initialized. Call initAudio() first.");
    return;
  }

  const noteName = midiToNoteName(midi);
  synth.triggerAttackRelease(noteName, duration, Tone.now(), velocity);
}

/**
 * Check if audio is initialized
 */
export function isAudioReady(): boolean {
  return isInitialized;
}
