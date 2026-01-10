"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { playNoteForDuration, initAudio } from "@/lib/audio/synth";

interface ChordType {
  name: string;
  symbol: string;
  intervals: number[];
  description: string;
}

const CHORD_TYPES: ChordType[] = [
  { name: "Major", symbol: "", intervals: [0, 4, 7], description: "Happy, bright, stable" },
  { name: "Minor", symbol: "m", intervals: [0, 3, 7], description: "Sad, dark, emotional" },
  { name: "Diminished", symbol: "dim", intervals: [0, 3, 6], description: "Tense, unstable" },
  { name: "Augmented", symbol: "aug", intervals: [0, 4, 8], description: "Dreamy, unresolved" },
  { name: "Major 7th", symbol: "maj7", intervals: [0, 4, 7, 11], description: "Jazzy, smooth" },
  { name: "Minor 7th", symbol: "m7", intervals: [0, 3, 7, 10], description: "Mellow, soulful" },
  { name: "Dominant 7th", symbol: "7", intervals: [0, 4, 7, 10], description: "Bluesy, wants to resolve" },
  { name: "Sus4", symbol: "sus4", intervals: [0, 5, 7], description: "Open, ambiguous" },
];

const ROOT_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BASE_MIDI = 60;

export function ChordBuilder() {
  const [rootIndex, setRootIndex] = useState(0);
  const [chordType, setChordType] = useState<ChordType>(CHORD_TYPES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingNotes, setPlayingNotes] = useState<Set<number>>(new Set());

  const playChord = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    await initAudio();

    // Set all notes as playing
    const noteMidis = chordType.intervals.map((interval) => BASE_MIDI + rootIndex + interval);
    setPlayingNotes(new Set(noteMidis));

    chordType.intervals.forEach((interval) => {
      playNoteForDuration(BASE_MIDI + rootIndex + interval, 1);
    });

    setTimeout(() => {
      setIsPlaying(false);
      setPlayingNotes(new Set());
    }, 1100);
  }, [rootIndex, chordType, isPlaying]);

  const playArpeggio = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    await initAudio();

    chordType.intervals.forEach((interval, i) => {
      setTimeout(() => {
        const noteMidi = BASE_MIDI + rootIndex + interval;
        setPlayingNotes((prev) => new Set(prev).add(noteMidi));
        playNoteForDuration(noteMidi, 0.4);

        // Clear note after it finishes
        setTimeout(() => {
          setPlayingNotes((prev) => {
            const next = new Set(prev);
            next.delete(noteMidi);
            return next;
          });
        }, 400);

        if (i === chordType.intervals.length - 1) {
          setTimeout(() => {
            setIsPlaying(false);
            setPlayingNotes(new Set());
          }, 500);
        }
      }, i * 200);
    });
  }, [rootIndex, chordType, isPlaying]);

  const chordName = `${ROOT_NOTES[rootIndex]}${chordType.symbol}`;
  const chordNotes = chordType.intervals.map((interval) => ROOT_NOTES[(rootIndex + interval) % 12]);

  // Get active semitones relative to C
  const activeSemitones = chordType.intervals.map((i) => (rootIndex + i) % 12);

  // Render keyboard with visual playback
  const renderKeyboard = () => {
    const whiteKeys = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B
    const blackKeys = [
      { semitone: 1, position: 1 },
      { semitone: 3, position: 2 },
      { semitone: 6, position: 4 },
      { semitone: 8, position: 5 },
      { semitone: 10, position: 6 },
    ];

    const noteNames = ["C", "D", "E", "F", "G", "A", "B"];

    return (
      <div className="relative inline-flex">
        {/* White keys */}
        {whiteKeys.map((semitone, i) => {
          const isActive = activeSemitones.includes(semitone);
          const isRoot = semitone === rootIndex % 12;
          const noteIndex = activeSemitones.indexOf(semitone);
          const noteMidi = BASE_MIDI + semitone;
          const isCurrentlyPlaying = playingNotes.has(noteMidi);

          return (
            <motion.button
              key={semitone}
              onClick={() => setRootIndex(semitone)}
              className={`relative w-14 h-40 rounded-b-lg border-x border-b flex flex-col items-center justify-between py-3 transition-all duration-100 ${
                isCurrentlyPlaying
                  ? "bg-green-400 border-green-500 text-white scale-[0.98] shadow-lg shadow-green-400/50"
                  : isActive
                  ? isRoot
                    ? "bg-indigo-500 border-indigo-600 text-white"
                    : "bg-indigo-300 border-indigo-400 text-indigo-900"
                  : "bg-white border-gray-300 hover:bg-gray-100 text-gray-600"
              }`}
              animate={{
                y: isCurrentlyPlaying ? 2 : 0,
              }}
              transition={{ duration: 0.05 }}
            >
              {isActive && (
                <span className="text-lg font-bold">
                  {isRoot ? "R" : noteIndex + 1}
                </span>
              )}
              {!isActive && <span />}
              <span className="text-sm font-medium">{noteNames[i]}</span>
            </motion.button>
          );
        })}

        {/* Black keys */}
        {blackKeys.map(({ semitone, position }) => {
          const isActive = activeSemitones.includes(semitone);
          const isRoot = semitone === rootIndex % 12;
          const noteIndex = activeSemitones.indexOf(semitone);
          const noteMidi = BASE_MIDI + semitone;
          const isCurrentlyPlaying = playingNotes.has(noteMidi);

          return (
            <motion.button
              key={semitone}
              onClick={() => setRootIndex(semitone)}
              className={`absolute top-0 w-9 h-24 rounded-b-lg flex flex-col items-center justify-start pt-2 z-10 transition-all duration-100 ${
                isCurrentlyPlaying
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                  : isActive
                  ? isRoot
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-400 text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-400"
              }`}
              style={{ left: position * 56 - 18 }}
              animate={{
                y: isCurrentlyPlaying ? 2 : 0,
              }}
              transition={{ duration: 0.05 }}
            >
              {isActive && (
                <span className="text-sm font-bold">
                  {isRoot ? "R" : noteIndex + 1}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Current chord display */}
      <div className="text-center">
        <motion.div
          key={chordName}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`inline-block px-8 py-4 rounded-2xl transition-colors ${
            isPlaying ? "bg-green-500" : "bg-indigo-600"
          } text-white`}
        >
          <div className="text-5xl font-bold">{chordName}</div>
          <div className="text-lg opacity-90 mt-1">{chordType.name}</div>
        </motion.div>
      </div>

      {/* Root note selector */}
      <div>
        <label className="text-sm text-gray-400 mb-3 block">Root Note</label>
        <div className="flex flex-wrap gap-2">
          {ROOT_NOTES.map((note, i) => {
            const isBlack = [1, 3, 6, 8, 10].includes(i);
            return (
              <button
                key={note}
                onClick={() => setRootIndex(i)}
                className={`w-12 h-12 rounded-lg font-bold transition-all ${
                  rootIndex === i
                    ? "bg-indigo-600 text-white shadow-lg"
                    : isBlack
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                {note}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chord type selector */}
      <div>
        <label className="text-sm text-gray-400 mb-3 block">Chord Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CHORD_TYPES.map((type) => (
            <button
              key={type.name}
              onClick={() => setChordType(type)}
              className={`p-3 rounded-xl text-left transition-all ${
                chordType.name === type.name
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              <div className="font-bold">{type.name}</div>
              <div className="text-xs opacity-75">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
        <div className="flex justify-center overflow-x-auto pb-4">
          {renderKeyboard()}
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={playChord}
            disabled={isPlaying}
            className={`px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 ${
              isPlaying ? "bg-green-500" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isPlaying ? "Playing..." : "Play Chord"}
          </button>
          <button
            onClick={playArpeggio}
            disabled={isPlaying}
            className="px-6 py-3 rounded-xl font-bold bg-gray-700 hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            Play Arpeggio
          </button>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-indigo-500" />
            <span className="text-gray-400">Chord tones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-400" />
            <span className="text-gray-400">Currently playing</span>
          </div>
        </div>
      </div>

      {/* Chord info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <span className="text-gray-400 text-sm">Notes</span>
          <div className="flex gap-2 mt-2 flex-wrap">
            {chordNotes.map((note, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  i === 0 ? "bg-indigo-600 text-white" : "bg-gray-700"
                }`}
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <span className="text-gray-400 text-sm">Intervals</span>
          <div className="flex gap-2 mt-2 flex-wrap">
            {chordType.intervals.map((interval, i) => (
              <span key={i} className="px-3 py-1 bg-gray-700 rounded text-sm">
                {interval === 0 ? "R" : interval}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <span className="text-gray-400 text-sm">Character</span>
          <p className="mt-2 text-sm">{chordType.description}</p>
        </div>
      </div>

      {/* Educational content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <h4 className="font-bold mb-2">Building Chords</h4>
          <p className="text-gray-400 text-sm">
            Chords are built by stacking intervals on top of a root note.
            Major chords use intervals of a major 3rd (4 semitones) and perfect 5th (7 semitones).
            Minor chords use a minor 3rd (3 semitones) instead.
          </p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
          <h4 className="font-bold mb-2">Chord Symbols</h4>
          <p className="text-gray-400 text-sm">
            &quot;C&quot; means C Major. &quot;Cm&quot; means C Minor. &quot;C7&quot; adds a dominant 7th.
            &quot;Cmaj7&quot; adds a major 7th. &quot;Cdim&quot; is diminished. &quot;Caug&quot; is augmented.
          </p>
        </div>
      </div>
    </div>
  );
}
