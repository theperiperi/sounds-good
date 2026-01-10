"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { playNoteForDuration, initAudio } from "@/lib/audio/synth";

interface Interval {
  name: string;
  semitones: number;
  quality: string;
  example: string;
  color: string;
}

const INTERVALS: Interval[] = [
  { name: "Unison", semitones: 0, quality: "Perfect", example: "Same note", color: "bg-gray-500" },
  { name: "Minor 2nd", semitones: 1, quality: "Minor", example: "Jaws theme", color: "bg-red-500" },
  { name: "Major 2nd", semitones: 2, quality: "Major", example: "Happy Birthday", color: "bg-orange-500" },
  { name: "Minor 3rd", semitones: 3, quality: "Minor", example: "Greensleeves", color: "bg-amber-500" },
  { name: "Major 3rd", semitones: 4, quality: "Major", example: "Kumbaya", color: "bg-yellow-500" },
  { name: "Perfect 4th", semitones: 5, quality: "Perfect", example: "Here Comes the Bride", color: "bg-lime-500" },
  { name: "Tritone", semitones: 6, quality: "Augmented/Diminished", example: "The Simpsons", color: "bg-green-500" },
  { name: "Perfect 5th", semitones: 7, quality: "Perfect", example: "Star Wars", color: "bg-emerald-500" },
  { name: "Minor 6th", semitones: 8, quality: "Minor", example: "The Entertainer", color: "bg-teal-500" },
  { name: "Major 6th", semitones: 9, quality: "Major", example: "NBC chime", color: "bg-cyan-500" },
  { name: "Minor 7th", semitones: 10, quality: "Minor", example: "Star Trek", color: "bg-blue-500" },
  { name: "Major 7th", semitones: 11, quality: "Major", example: "Take On Me", color: "bg-indigo-500" },
  { name: "Octave", semitones: 12, quality: "Perfect", example: "Somewhere Over the Rainbow", color: "bg-violet-500" },
];

const BASE_NOTE = 60; // Middle C

export function IntervalVisualizer() {
  const [selectedInterval, setSelectedInterval] = useState<Interval>(INTERVALS[7]); // Perfect 5th
  const [isPlaying, setIsPlaying] = useState(false);

  const playInterval = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    await initAudio();

    // Play root note
    playNoteForDuration(BASE_NOTE, 0.5);

    // Play interval note after delay
    setTimeout(() => {
      playNoteForDuration(BASE_NOTE + selectedInterval.semitones, 0.5);
      setTimeout(() => setIsPlaying(false), 600);
    }, 600);
  }, [selectedInterval, isPlaying]);

  const playTogether = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    await initAudio();

    // Play both notes together
    playNoteForDuration(BASE_NOTE, 0.8);
    playNoteForDuration(BASE_NOTE + selectedInterval.semitones, 0.8);

    setTimeout(() => setIsPlaying(false), 900);
  }, [selectedInterval, isPlaying]);

  return (
    <div className="space-y-8">
      {/* Keyboard visualization */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <div className="flex justify-center mb-6">
          <div className="flex relative">
            {/* White keys */}
            {[0, 2, 4, 5, 7, 9, 11, 12].map((semitone, i) => {
              const isRoot = semitone === 0;
              const isInterval = semitone === selectedInterval.semitones;
              const noteNames = ["C", "D", "E", "F", "G", "A", "B", "C"];

              return (
                <motion.div
                  key={semitone}
                  className={`w-12 h-32 border border-gray-300 rounded-b-lg flex flex-col items-center justify-end pb-2 ${
                    isRoot
                      ? "bg-indigo-400"
                      : isInterval
                      ? selectedInterval.color.replace("bg-", "bg-") + " text-white"
                      : "bg-white"
                  }`}
                  animate={{
                    scale: isRoot || isInterval ? 1.02 : 1,
                    y: isRoot || isInterval ? -4 : 0,
                  }}
                >
                  <span className={`text-xs font-medium ${isRoot || isInterval ? "text-white" : "text-gray-600"}`}>
                    {noteNames[i]}
                  </span>
                  {isRoot && (
                    <span className="text-[10px] text-white/80">Root</span>
                  )}
                  {isInterval && semitone !== 0 && (
                    <span className="text-[10px] text-white/80">{selectedInterval.semitones}</span>
                  )}
                </motion.div>
              );
            })}

            {/* Black keys */}
            {[1, 3, 6, 8, 10].map((semitone, i) => {
              const isInterval = semitone === selectedInterval.semitones;
              const positions = [1, 2, 4, 5, 6];

              return (
                <motion.div
                  key={semitone}
                  className={`absolute w-8 h-20 rounded-b-lg ${
                    isInterval
                      ? selectedInterval.color
                      : "bg-gray-900"
                  }`}
                  style={{ left: `${positions[i] * 48 - 16}px`, top: 0 }}
                  animate={{
                    scale: isInterval ? 1.05 : 1,
                  }}
                >
                  {isInterval && (
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white">
                      {semitone}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Play buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={playInterval}
            disabled={isPlaying}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
          >
            Play Melodic ↗
          </button>
          <button
            onClick={playTogether}
            disabled={isPlaying}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
          >
            Play Harmonic ⟷
          </button>
        </div>
      </div>

      {/* Interval selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {INTERVALS.map((interval) => (
          <button
            key={interval.semitones}
            onClick={() => setSelectedInterval(interval)}
            className={`p-3 rounded-xl text-left transition-all ${
              selectedInterval.semitones === interval.semitones
                ? `${interval.color} text-white shadow-lg`
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <div className="font-bold text-sm">{interval.name}</div>
            <div className="text-xs opacity-75">{interval.semitones} semitones</div>
          </button>
        ))}
      </div>

      {/* Selected interval info */}
      <motion.div
        key={selectedInterval.name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${selectedInterval.color} rounded-2xl p-6 text-white`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold">{selectedInterval.name}</h3>
            <p className="text-white/80">{selectedInterval.quality} interval</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{selectedInterval.semitones}</div>
            <div className="text-sm text-white/80">semitones</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <span className="text-white/60 text-sm">Remember it from:</span>
          <p className="text-lg font-medium">{selectedInterval.example}</p>
        </div>
      </motion.div>
    </div>
  );
}
