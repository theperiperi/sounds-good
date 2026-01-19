"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Minus, Plus } from "lucide-react";

interface NoteValue {
  name: string;
  beats: number;
  filled: boolean;
  hasStem: boolean;
  hasFlag: number; // 0 = none, 1 = eighth, 2 = sixteenth
}

const NOTE_VALUES: NoteValue[] = [
  { name: "Whole", beats: 4, filled: false, hasStem: false, hasFlag: 0 },
  { name: "Half", beats: 2, filled: false, hasStem: true, hasFlag: 0 },
  { name: "Quarter", beats: 1, filled: true, hasStem: true, hasFlag: 0 },
  { name: "Eighth", beats: 0.5, filled: true, hasStem: true, hasFlag: 1 },
  { name: "Sixteenth", beats: 0.25, filled: true, hasStem: true, hasFlag: 2 },
];

interface TimeSignature {
  name: string;
  top: number;
  bottom: number;
  feel: string;
  examples: string[];
}

const TIME_SIGNATURES: TimeSignature[] = [
  { name: "Common Time", top: 4, bottom: 4, feel: "March, pop, rock", examples: ["Most pop songs", "Rock anthems"] },
  { name: "Waltz Time", top: 3, bottom: 4, feel: "Dance, flowing", examples: ["Waltzes", "Many ballads"] },
  { name: "Cut Time", top: 2, bottom: 2, feel: "Fast march", examples: ["Marches", "Fast classical"] },
  { name: "Compound", top: 6, bottom: 8, feel: "Rolling, triplet feel", examples: ["Irish jigs", "Blues shuffles"] },
  { name: "Odd Meter", top: 5, bottom: 4, feel: "Unusual, progressive", examples: ["Take Five", "Mission Impossible"] },
  { name: "Complex", top: 7, bottom: 8, feel: "Asymmetric", examples: ["Money (Pink Floyd)", "Prog rock"] },
];

// SVG Note Component
function NoteSVG({ filled, hasStem, hasFlag, size = 60 }: { filled: boolean; hasStem: boolean; hasFlag: number; size?: number }) {
  const scale = size / 60;

  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 60 90" className="mx-auto">
      {/* Note head */}
      <ellipse
        cx="20"
        cy="60"
        rx="12"
        ry="9"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2.5"
        transform="rotate(-20 20 60)"
      />

      {/* Stem */}
      {hasStem && (
        <line
          x1="30"
          y1="55"
          x2="30"
          y2="15"
          stroke="currentColor"
          strokeWidth="2.5"
        />
      )}

      {/* Flag(s) */}
      {hasFlag >= 1 && (
        <path
          d="M30 15 Q45 25 35 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
      )}
      {hasFlag >= 2 && (
        <path
          d="M30 25 Q45 35 35 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
      )}
    </svg>
  );
}

export function RhythmVisualizer() {
  const [selectedTime, setSelectedTime] = useState<TimeSignature>(TIME_SIGNATURES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState<number | null>(null);
  const [tempo, setTempo] = useState(100);
  const [selectedNote, setSelectedNote] = useState<NoteValue | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new AudioContext();
    return () => {
      audioRef.current?.close();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const playClick = useCallback((accent: boolean = false) => {
    if (!audioRef.current) return;

    const osc = audioRef.current.createOscillator();
    const gain = audioRef.current.createGain();

    osc.connect(gain);
    gain.connect(audioRef.current.destination);

    osc.frequency.value = accent ? 1000 : 800;
    gain.gain.value = accent ? 0.3 : 0.15;
    gain.gain.exponentialRampToValueAtTime(0.01, audioRef.current.currentTime + 0.1);

    osc.start();
    osc.stop(audioRef.current.currentTime + 0.1);
  }, []);

  const playMetronome = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);

    const beatDuration = 60000 / tempo;
    let beat = 0;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Play continuously until stopped
    intervalRef.current = setInterval(() => {
      const beatInMeasure = beat % selectedTime.top;
      setCurrentBeat(beatInMeasure);
      playClick(beatInMeasure === 0);
      beat++;
    }, beatDuration);
  }, [isPlaying, tempo, selectedTime, playClick]);

  const stopMetronome = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(null);
  }, []);

  // Play a note value demonstration
  const playNoteDemo = useCallback((note: NoteValue) => {
    if (!audioRef.current || isPlaying) return;

    setSelectedNote(note);
    const beatDuration = 60000 / tempo;
    const noteDuration = note.beats * beatDuration;

    const osc = audioRef.current.createOscillator();
    const gain = audioRef.current.createGain();

    osc.connect(gain);
    gain.connect(audioRef.current.destination);

    osc.frequency.value = 440; // A4
    gain.gain.value = 0.2;
    gain.gain.setValueAtTime(0.2, audioRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioRef.current.currentTime + noteDuration / 1000);

    osc.start();
    osc.stop(audioRef.current.currentTime + noteDuration / 1000);

    setTimeout(() => setSelectedNote(null), noteDuration);
  }, [tempo, isPlaying]);

  // Render a measure with beat markers
  const renderMeasure = () => {
    const beats = Array.from({ length: selectedTime.top }, (_, i) => i);

    return (
      <div className="flex items-center gap-2">
        {beats.map((beat) => (
          <motion.div
            key={beat}
            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
              currentBeat === beat
                ? beat === 0
                  ? "bg-gold text-black"
                  : "bg-gold-light text-black"
                : beat === 0
                ? "bg-secondary text-foreground"
                : "bg-secondary/50 text-muted-foreground"
            }`}
            animate={{
              scale: currentBeat === beat ? 1.1 : 1,
            }}
            transition={{ duration: 0.1 }}
          >
            {beat + 1}
          </motion.div>
        ))}
      </div>
    );
  };

  // Render note value cards with SVG notes
  const renderNoteValues = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {NOTE_VALUES.map((note) => (
          <motion.button
            key={note.name}
            onClick={() => playNoteDemo(note)}
            className={`bg-secondary rounded-xl p-4 text-center transition-all hover:bg-secondary/80 ${
              selectedNote?.name === note.name ? "ring-2 ring-gold bg-gold/20" : ""
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`text-foreground ${selectedNote?.name === note.name ? "text-gold" : ""}`}>
              <NoteSVG
                filled={note.filled}
                hasStem={note.hasStem}
                hasFlag={note.hasFlag}
                size={50}
              />
            </div>
            <div className="font-bold text-sm mt-2">{note.name}</div>
            <div className="text-muted-foreground text-xs mt-1">
              {note.beats} beat{note.beats !== 1 ? "s" : ""}
            </div>
            {/* Visual duration bar */}
            <div className="mt-3 flex justify-center">
              <motion.div
                className="h-2 bg-gold rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: selectedNote?.name === note.name ? `${note.beats * 25}px` : `${note.beats * 25}px`,
                  opacity: selectedNote?.name === note.name ? [1, 0.5, 1] : 1
                }}
                transition={{
                  duration: selectedNote?.name === note.name ? note.beats * (60 / tempo) : 0,
                  opacity: { repeat: Infinity, duration: 0.5 }
                }}
                style={{ width: `${note.beats * 25}px` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">Click to hear</div>
          </motion.button>
        ))}
      </div>
    );
  };

  // Render a visual staff with notes
  const renderStaff = () => {
    const lines = [0, 1, 2, 3, 4];

    return (
      <div className="relative bg-card/80 border border-border rounded-xl p-6 overflow-hidden">
        <svg className="w-full h-32" viewBox="0 0 400 80">
          {/* Staff lines */}
          {lines.map((line) => (
            <line
              key={line}
              x1="0"
              y1={16 + line * 12}
              x2="400"
              y2={16 + line * 12}
              stroke="rgb(75 85 99)"
              strokeWidth="1"
            />
          ))}

          {/* Time signature */}
          <text x="20" y="35" fill="white" fontSize="24" fontWeight="bold" fontFamily="serif">
            {selectedTime.top}
          </text>
          <text x="20" y="60" fill="white" fontSize="24" fontWeight="bold" fontFamily="serif">
            {selectedTime.bottom}
          </text>

          {/* Bar line */}
          <line x1="50" y1="16" x2="50" y2="64" stroke="rgb(107 114 128)" strokeWidth="1" />

          {/* Example notes - render based on time signature */}
          {renderStaffNotes()}

          {/* End bar line */}
          <line x1="380" y1="16" x2="380" y2="64" stroke="rgb(107 114 128)" strokeWidth="1" />
          <line x1="385" y1="16" x2="385" y2="64" stroke="rgb(107 114 128)" strokeWidth="3" />
        </svg>
      </div>
    );
  };

  const renderStaffNotes = () => {
    const noteCount = selectedTime.top;
    const spacing = 280 / noteCount;

    return (
      <>
        {Array.from({ length: noteCount }, (_, i) => {
          const x = 70 + i * spacing;
          const isAccent = i === 0;
          const isPlaying = currentBeat === i;

          return (
            <g key={i}>
              {/* Note head */}
              <ellipse
                cx={x}
                cy={40}
                rx="8"
                ry="6"
                fill={isPlaying ? "#d4a853" : "white"}
                className="transition-all duration-100"
              />
              {/* Stem */}
              <line
                x1={x + 7}
                y1={40}
                x2={x + 7}
                y2={12}
                stroke={isPlaying ? "#d4a853" : "white"}
                strokeWidth="2"
                className="transition-all duration-100"
              />
              {/* Beat number below */}
              <text
                x={x}
                y="78"
                fill={isPlaying ? "#d4a853" : isAccent ? "#9ca3af" : "#6b7280"}
                fontSize="10"
                textAnchor="middle"
                fontWeight={isAccent ? "bold" : "normal"}
              >
                {i + 1}
              </text>
            </g>
          );
        })}
      </>
    );
  };

  return (
    <div className="space-y-8">
      {/* Time signature selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {TIME_SIGNATURES.map((ts) => (
          <button
            key={ts.name}
            onClick={() => setSelectedTime(ts)}
            className={`p-4 rounded-xl text-center transition-all ${
              selectedTime.name === ts.name
                ? "gradient-gold text-black shadow-lg"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <div className="text-3xl font-bold font-serif">
              <span className="block">{ts.top}</span>
              <span className="block border-t border-current">{ts.bottom}</span>
            </div>
            <div className="text-xs mt-2 opacity-80">{ts.name}</div>
          </button>
        ))}
      </div>

      {/* Staff visualization */}
      {renderStaff()}

      {/* Beat visualization with metronome */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold font-serif mb-3">Beat Pattern</h3>
              {renderMeasure()}
            </div>

            <div className="flex items-center gap-6">
              {/* Tempo control */}
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Tempo</div>
                <div className="flex items-center bg-secondary rounded-lg p-1">
                  <button
                    onClick={() => setTempo((t) => Math.max(40, t - 10))}
                    className="w-8 h-8 rounded-md hover:bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-bold text-gold">{tempo}</span>
                  <button
                    onClick={() => setTempo((t) => Math.min(200, t + 10))}
                    className="w-8 h-8 rounded-md hover:bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">BPM</div>
              </div>

              {/* Play/Stop button */}
              {isPlaying ? (
                <Button
                  onClick={stopMetronome}
                  variant="secondary"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button
                  onClick={playMetronome}
                  className="gradient-gold text-black hover:opacity-90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play Beats
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note values */}
      <div>
        <h3 className="text-lg font-bold font-serif mb-4">Note Values</h3>
        <p className="text-muted-foreground text-sm mb-4">Click any note to hear its duration at the current tempo.</p>
        {renderNoteValues()}
      </div>

      {/* Time signature info */}
      <motion.div
        key={selectedTime.name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="gradient-gold text-black">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl font-bold font-serif">
                <span className="block">{selectedTime.top}</span>
                <span className="block border-t-2 border-black">{selectedTime.bottom}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif">{selectedTime.name}</h3>
                <p className="text-black/70 mt-1">{selectedTime.feel}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {selectedTime.examples.map((ex, i) => (
                    <Badge key={i} variant="outline" className="bg-black/10 border-black/20 text-black">
                      {ex}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Educational content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-5">
            <h4 className="font-bold font-serif mb-2">Understanding Time Signatures</h4>
            <p className="text-muted-foreground text-sm">
              The <strong className="text-gold">top number</strong> tells you how many beats are in each measure.
              The <strong className="text-gold">bottom number</strong> tells you which note value gets one beat
              (4 = quarter note, 8 = eighth note).
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-5">
            <h4 className="font-bold font-serif mb-2">Counting Rhythms</h4>
            <p className="text-muted-foreground text-sm">
              In 4/4 time, count &quot;1, 2, 3, 4&quot; for each measure. For eighth notes, add &quot;&amp;&quot; between:
              &quot;1 &amp; 2 &amp; 3 &amp; 4 &amp;&quot;. For sixteenths: &quot;1 e &amp; a 2 e &amp; a...&quot;
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
