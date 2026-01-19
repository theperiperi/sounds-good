"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { playNoteForDuration, initAudio } from "@/lib/audio/synth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Music } from "lucide-react";

interface Interval {
  name: string;
  semitones: number;
  quality: string;
  example: string;
}

const INTERVALS: Interval[] = [
  { name: "Unison", semitones: 0, quality: "Perfect", example: "Same note" },
  { name: "Minor 2nd", semitones: 1, quality: "Minor", example: "Jaws theme" },
  { name: "Major 2nd", semitones: 2, quality: "Major", example: "Happy Birthday" },
  { name: "Minor 3rd", semitones: 3, quality: "Minor", example: "Greensleeves" },
  { name: "Major 3rd", semitones: 4, quality: "Major", example: "Kumbaya" },
  { name: "Perfect 4th", semitones: 5, quality: "Perfect", example: "Here Comes the Bride" },
  { name: "Tritone", semitones: 6, quality: "Aug/Dim", example: "The Simpsons" },
  { name: "Perfect 5th", semitones: 7, quality: "Perfect", example: "Star Wars" },
  { name: "Minor 6th", semitones: 8, quality: "Minor", example: "The Entertainer" },
  { name: "Major 6th", semitones: 9, quality: "Major", example: "NBC chime" },
  { name: "Minor 7th", semitones: 10, quality: "Minor", example: "Star Trek" },
  { name: "Major 7th", semitones: 11, quality: "Major", example: "Take On Me" },
  { name: "Octave", semitones: 12, quality: "Perfect", example: "Somewhere Over the Rainbow" },
];

const BASE_NOTE = 60;

export function IntervalVisualizer() {
  const [selectedInterval, setSelectedInterval] = useState<Interval>(INTERVALS[7]);
  const [isPlaying, setIsPlaying] = useState(false);

  const playInterval = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    await initAudio();

    playNoteForDuration(BASE_NOTE, 0.5);

    setTimeout(() => {
      playNoteForDuration(BASE_NOTE + selectedInterval.semitones, 0.5);
      setTimeout(() => setIsPlaying(false), 600);
    }, 600);
  }, [selectedInterval, isPlaying]);

  const playTogether = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    await initAudio();

    playNoteForDuration(BASE_NOTE, 0.8);
    playNoteForDuration(BASE_NOTE + selectedInterval.semitones, 0.8);

    setTimeout(() => setIsPlaying(false), 900);
  }, [selectedInterval, isPlaying]);

  return (
    <div className="space-y-8">
      {/* Keyboard visualization */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-6">
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
                    className={`w-12 h-32 border border-gray-300 rounded-b-lg flex flex-col items-center justify-end pb-2 transition-colors ${
                      isRoot
                        ? "bg-gold"
                        : isInterval
                        ? "bg-gold-light"
                        : "bg-white"
                    }`}
                    animate={{
                      scale: isRoot || isInterval ? 1.02 : 1,
                      y: isRoot || isInterval ? -4 : 0,
                    }}
                  >
                    <span className={`text-xs font-medium ${isRoot || isInterval ? "text-black" : "text-gray-600"}`}>
                      {noteNames[i]}
                    </span>
                    {isRoot && (
                      <span className="text-[10px] text-black/70">Root</span>
                    )}
                    {isInterval && semitone !== 0 && (
                      <span className="text-[10px] text-black/70">{selectedInterval.semitones}</span>
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
                        ? "bg-gold"
                        : "bg-gray-900"
                    }`}
                    style={{ left: `${positions[i] * 48 - 16}px`, top: 0 }}
                    animate={{
                      scale: isInterval ? 1.05 : 1,
                    }}
                  >
                    {isInterval && (
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-black font-bold">
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
            <Button
              onClick={playInterval}
              disabled={isPlaying}
              className="gradient-gold text-black hover:opacity-90"
            >
              <Play className="w-4 h-4 mr-2" />
              Melodic
            </Button>
            <Button
              onClick={playTogether}
              disabled={isPlaying}
              variant="secondary"
            >
              <Music className="w-4 h-4 mr-2" />
              Harmonic
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interval selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {INTERVALS.map((interval) => (
          <button
            key={interval.semitones}
            onClick={() => setSelectedInterval(interval)}
            className={`p-3 rounded-xl text-left transition-all ${
              selectedInterval.semitones === interval.semitones
                ? "gradient-gold text-black shadow-lg"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <div className="font-bold text-sm">{interval.name}</div>
            <div className="text-xs opacity-75">{interval.semitones} st</div>
          </button>
        ))}
      </div>

      {/* Selected interval info */}
      <motion.div
        key={selectedInterval.name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="gradient-gold text-black">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold font-serif">{selectedInterval.name}</h3>
                <p className="text-black/70">{selectedInterval.quality} interval</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{selectedInterval.semitones}</div>
                <div className="text-sm text-black/70">semitones</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-black/20">
              <span className="text-black/60 text-sm">Remember it from:</span>
              <p className="text-lg font-medium">{selectedInterval.example}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
