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

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "triangle",
    },
    envelope: {
      attack: 0.02,
      decay: 0.1,
      sustain: 0.3,
      release: 1,
    },
  }).toDestination();

  // Add a subtle reverb for a nicer piano-like sound
  const reverb = new Tone.Reverb({
    decay: 1.5,
    wet: 0.2,
  }).toDestination();

  synth.connect(reverb);

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
