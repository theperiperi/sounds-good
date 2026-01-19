"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useComposerStore, SheetNote } from "@/stores/composerStore";
import { initAudio, playNoteForDuration } from "@/lib/audio/synth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Minus, Plus } from "lucide-react";

// Staff configuration
const STAFF_LINE_SPACING = 10;
const STAFF_START_Y = 40;
const MEASURE_WIDTH = 200;
const NOTE_RADIUS = 5;

// MIDI to staff position mapping (middle C = MIDI 60 = ledger line below treble staff)
// Treble clef: E4 (64) is bottom line, F5 (77) is top line
// Extended range to allow notes below and above the staff
function midiToStaffY(midi: number): number {
  // Staff positions: 0 = bottom line (E4), 4 = top line (F5)
  // Negative positions are below staff, positions > 4 are above staff
  // Each white key step = 0.5 staff spacing

  // Extended range: G3 (55) to C6 (84)
  const whiteKeyMidi = [
    48, 50, 52, 53, 55, 57, 59, // C3 to B3
    60, 62, 64, 65, 67, 69, 71, // C4 to B4
    72, 74, 76, 77, 79, 81, 83, 84 // C5 to C6
  ];
  const positions = [
    17, 16, 15, 14, 13, 12, 11, // C3 to B3 (far below staff)
    10, 9, 8, 7, 6, 5, 4,       // C4 to B4 (around/below staff)
    3, 2, 1, 0, -1, -2, -3, -4  // C5 to C6 (on/above staff)
  ];

  // Find closest white key
  let closestIdx = 0;
  let minDiff = Infinity;
  whiteKeyMidi.forEach((m, i) => {
    const diff = Math.abs(midi - m);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  });

  const pos = positions[closestIdx];
  return STAFF_START_Y + (4 - pos) * (STAFF_LINE_SPACING / 2);
}

function staffYToMidi(y: number): number {
  // Reverse of midiToStaffY
  const pos = 4 - Math.round((y - STAFF_START_Y) / (STAFF_LINE_SPACING / 2));

  // Extended range mapping
  const whiteKeyMidi = [
    48, 50, 52, 53, 55, 57, 59, // C3 to B3
    60, 62, 64, 65, 67, 69, 71, // C4 to B4
    72, 74, 76, 77, 79, 81, 83, 84 // C5 to C6
  ];
  const positions = [
    17, 16, 15, 14, 13, 12, 11, // C3 to B3
    10, 9, 8, 7, 6, 5, 4,       // C4 to B4
    3, 2, 1, 0, -1, -2, -3, -4  // C5 to C6
  ];

  const idx = positions.indexOf(pos);
  if (idx >= 0 && idx < whiteKeyMidi.length) {
    return whiteKeyMidi[idx];
  }

  // Handle positions outside the mapped range
  if (pos > 17) return 48; // Below C3, return C3
  if (pos < -4) return 84; // Above C6, return C6

  // Linear interpolation for unmapped positions
  if (pos > positions[0]) {
    return whiteKeyMidi[0];
  }
  if (pos < positions[positions.length - 1]) {
    return whiteKeyMidi[whiteKeyMidi.length - 1];
  }

  return 72; // Default to C5
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[midi % 12]}${octave}`;
}

const KEY_SIGNATURES: { name: string; value: number }[] = [
  { name: "C Major / A minor", value: 0 },
  { name: "G Major / E minor", value: 1 },
  { name: "D Major / B minor", value: 2 },
  { name: "A Major / F# minor", value: 3 },
  { name: "E Major / C# minor", value: 4 },
  { name: "F Major / D minor", value: -1 },
  { name: "Bb Major / G minor", value: -2 },
  { name: "Eb Major / C minor", value: -3 },
  { name: "Ab Major / F minor", value: -4 },
];

const TIME_SIGNATURES: [number, number][] = [
  [4, 4],
  [3, 4],
  [2, 4],
  [6, 8],
  [2, 2],
];

const DURATIONS = [
  { value: 4, name: "Whole", symbol: "𝅝" },
  { value: 2, name: "Half", symbol: "𝅗𝅥" },
  { value: 1, name: "Quarter", symbol: "♩" },
  { value: 0.5, name: "Eighth", symbol: "♪" },
  { value: 0.25, name: "16th", symbol: "𝅘𝅥𝅯" },
];

export function SheetMusicEditor() {
  const {
    notes,
    timeSignature,
    keySignature,
    tempo,
    measures,
    selectedDuration,
    isPlaying,
    currentPlaybackBeat,
    addNote,
    removeNote,
    clearNotes,
    setTimeSignature,
    setKeySignature,
    setTempo,
    setMeasures,
    setSelectedDuration,
    setIsPlaying,
    setCurrentPlaybackBeat,
  } = useComposerStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number } | null>(null);

  const totalWidth = measures * MEASURE_WIDTH + 100;
  const staffHeight = 160; // Increased to allow notes below and above staff

  // Handle click to add note
  const handleStaffClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || isPlaying) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate measure and beat from x position
      const measureX = x - 60; // Account for clef area
      if (measureX < 0) return;

      const measure = Math.floor(measureX / MEASURE_WIDTH);
      if (measure >= measures) return;

      const beatWidth = MEASURE_WIDTH / timeSignature[0];
      const beat = Math.floor((measureX % MEASURE_WIDTH) / beatWidth);

      // Calculate MIDI from y position
      const midi = staffYToMidi(y);

      // Check if there's already a note at this position
      const existingNote = notes.find(
        (n) => n.measure === measure && n.beat === beat && n.midi === midi
      );

      if (existingNote) {
        removeNote(existingNote.id);
      } else {
        addNote(midi, beat, measure);
        // Play the note
        initAudio().then(() => {
          playNoteForDuration(midi, 0.3);
        });
      }
    },
    [notes, measures, timeSignature, selectedDuration, isPlaying, addNote, removeNote]
  );

  // Handle mouse move for preview
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || isPlaying) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Snap to grid
      const measureX = x - 60;
      if (measureX < 0 || measureX >= measures * MEASURE_WIDTH) {
        setHoveredPosition(null);
        return;
      }

      const measure = Math.floor(measureX / MEASURE_WIDTH);
      const beatWidth = MEASURE_WIDTH / timeSignature[0];
      const beat = Math.floor((measureX % MEASURE_WIDTH) / beatWidth);

      const snappedX = 60 + measure * MEASURE_WIDTH + beat * beatWidth + beatWidth / 2;
      const midi = staffYToMidi(y);
      const snappedY = midiToStaffY(midi);

      setHoveredPosition({ x: snappedX, y: snappedY });
    },
    [measures, timeSignature, isPlaying]
  );

  // Play back the composition
  const playComposition = useCallback(async () => {
    if (isPlaying || notes.length === 0) return;

    setIsPlaying(true);
    await initAudio();

    const beatDuration = (60 / tempo) * 1000; // ms per beat
    const totalBeats = measures * timeSignature[0];

    for (let globalBeat = 0; globalBeat < totalBeats; globalBeat++) {
      const measure = Math.floor(globalBeat / timeSignature[0]);
      const beat = globalBeat % timeSignature[0];

      setTimeout(() => {
        setCurrentPlaybackBeat(globalBeat);

        // Find notes at this position
        const notesAtBeat = notes.filter(
          (n) => n.measure === measure && n.beat === beat
        );

        notesAtBeat.forEach((note) => {
          playNoteForDuration(note.midi, note.duration * (60 / tempo));
        });

        if (globalBeat === totalBeats - 1) {
          setTimeout(() => {
            setIsPlaying(false);
            setCurrentPlaybackBeat(null);
          }, beatDuration);
        }
      }, globalBeat * beatDuration);
    }
  }, [notes, measures, timeSignature, tempo, isPlaying, setIsPlaying, setCurrentPlaybackBeat]);

  // Render staff lines
  const renderStaff = () => {
    const lines = [];

    // Draw 5 staff lines
    for (let i = 0; i < 5; i++) {
      lines.push(
        <line
          key={`line-${i}`}
          x1="0"
          y1={STAFF_START_Y + i * STAFF_LINE_SPACING}
          x2={totalWidth}
          y2={STAFF_START_Y + i * STAFF_LINE_SPACING}
          stroke="#4b5563"
          strokeWidth="1"
        />
      );
    }

    // Draw bar lines
    for (let m = 0; m <= measures; m++) {
      const x = 60 + m * MEASURE_WIDTH;
      lines.push(
        <line
          key={`bar-${m}`}
          x1={x}
          y1={STAFF_START_Y}
          x2={x}
          y2={STAFF_START_Y + 4 * STAFF_LINE_SPACING}
          stroke="#6b7280"
          strokeWidth={m === measures ? 3 : 1}
        />
      );
    }

    // Beat subdivisions (lighter lines)
    for (let m = 0; m < measures; m++) {
      for (let b = 1; b < timeSignature[0]; b++) {
        const x = 60 + m * MEASURE_WIDTH + b * (MEASURE_WIDTH / timeSignature[0]);
        lines.push(
          <line
            key={`beat-${m}-${b}`}
            x1={x}
            y1={STAFF_START_Y}
            x2={x}
            y2={STAFF_START_Y + 4 * STAFF_LINE_SPACING}
            stroke="#374151"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        );
      }
    }

    return lines;
  };

  // Render treble clef
  const renderClef = () => (
    <text
      x="10"
      y={STAFF_START_Y + 35}
      fontSize="50"
      fill="white"
      fontFamily="serif"
    >
      𝄞
    </text>
  );

  // Render time signature
  const renderTimeSignature = () => (
    <g>
      <text x="45" y={STAFF_START_Y + 15} fontSize="18" fill="white" fontWeight="bold">
        {timeSignature[0]}
      </text>
      <text x="45" y={STAFF_START_Y + 35} fontSize="18" fill="white" fontWeight="bold">
        {timeSignature[1]}
      </text>
    </g>
  );

  // Render notes
  const renderNotes = () => {
    return notes.map((note) => {
      const beatWidth = MEASURE_WIDTH / timeSignature[0];
      const x = 60 + note.measure * MEASURE_WIDTH + note.beat * beatWidth + beatWidth / 2;
      const y = midiToStaffY(note.midi);

      const globalBeat = note.measure * timeSignature[0] + note.beat;
      const isCurrentlyPlaying = currentPlaybackBeat === globalBeat;

      // Determine if we need ledger lines
      const ledgerLines = [];
      const staffBottom = STAFF_START_Y + 4 * STAFF_LINE_SPACING;
      if (y > staffBottom) {
        // Below staff - add ledger lines
        for (let ly = staffBottom + STAFF_LINE_SPACING; ly <= y; ly += STAFF_LINE_SPACING) {
          ledgerLines.push(
            <line
              key={`ledger-${note.id}-${ly}`}
              x1={x - 12}
              x2={x + 12}
              y1={ly}
              y2={ly}
              stroke="#4b5563"
              strokeWidth="1"
            />
          );
        }
      }
      if (y < STAFF_START_Y) {
        // Above staff - add ledger lines
        for (let ly = STAFF_START_Y - STAFF_LINE_SPACING; ly >= y; ly -= STAFF_LINE_SPACING) {
          ledgerLines.push(
            <line
              key={`ledger-${note.id}-${ly}`}
              x1={x - 12}
              x2={x + 12}
              y1={ly}
              y2={ly}
              stroke="#4b5563"
              strokeWidth="1"
            />
          );
        }
      }

      // Determine if note head should be filled
      const filled = note.duration <= 1;

      return (
        <g key={note.id}>
          {ledgerLines}
          <motion.ellipse
            cx={x}
            cy={y}
            rx={NOTE_RADIUS + 2}
            ry={NOTE_RADIUS}
            fill={isCurrentlyPlaying ? "#22c55e" : filled ? "#d4a853" : "none"}
            stroke={isCurrentlyPlaying ? "#22c55e" : "#d4a853"}
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              removeNote(note.id);
            }}
          />
          {/* Stem */}
          {note.duration < 4 && (
            <line
              x1={x + NOTE_RADIUS + 1}
              y1={y}
              x2={x + NOTE_RADIUS + 1}
              y2={y - 30}
              stroke={isCurrentlyPlaying ? "#22c55e" : "#d4a853"}
              strokeWidth="2"
            />
          )}
          {/* Flag for eighth notes */}
          {note.duration <= 0.5 && (
            <path
              d={`M${x + NOTE_RADIUS + 1} ${y - 30} Q${x + 20} ${y - 20} ${x + 10} ${y - 10}`}
              fill="none"
              stroke={isCurrentlyPlaying ? "#22c55e" : "#d4a853"}
              strokeWidth="2"
            />
          )}
        </g>
      );
    });
  };

  // Render playback position indicator
  const renderPlaybackIndicator = () => {
    if (currentPlaybackBeat === null) return null;

    const measure = Math.floor(currentPlaybackBeat / timeSignature[0]);
    const beat = currentPlaybackBeat % timeSignature[0];
    const beatWidth = MEASURE_WIDTH / timeSignature[0];
    const x = 60 + measure * MEASURE_WIDTH + beat * beatWidth;

    return (
      <rect
        x={x}
        y={STAFF_START_Y - 5}
        width={beatWidth}
        height={4 * STAFF_LINE_SPACING + 10}
        fill="#22c55e"
        opacity="0.2"
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Time signature */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Time:</span>
              <select
                value={`${timeSignature[0]}/${timeSignature[1]}`}
                onChange={(e) => {
                  const [top, bottom] = e.target.value.split("/").map(Number);
                  setTimeSignature([top, bottom]);
                }}
                className="bg-secondary rounded px-3 py-1.5 text-sm border-0"
              >
                {TIME_SIGNATURES.map(([t, b]) => (
                  <option key={`${t}/${b}`} value={`${t}/${b}`}>
                    {t}/{b}
                  </option>
                ))}
              </select>
            </div>

            {/* Key signature */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Key:</span>
              <select
                value={keySignature}
                onChange={(e) => setKeySignature(Number(e.target.value))}
                className="bg-secondary rounded px-3 py-1.5 text-sm border-0"
              >
                {KEY_SIGNATURES.map((ks) => (
                  <option key={ks.value} value={ks.value}>
                    {ks.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tempo */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Tempo:</span>
              <div className="flex items-center bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setTempo(tempo - 10)}
                  className="w-8 h-8 rounded-md hover:bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-gold">{tempo}</span>
                <button
                  onClick={() => setTempo(tempo + 10)}
                  className="w-8 h-8 rounded-md hover:bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Measures */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Measures:</span>
              <div className="flex items-center bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setMeasures(measures - 1)}
                  className="w-8 h-8 rounded-md hover:bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{measures}</span>
                <button
                  onClick={() => setMeasures(measures + 1)}
                  className="w-8 h-8 rounded-md hover:bg-background/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note duration selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground font-medium">Note value:</span>
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDuration(d.value)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                selectedDuration === d.value
                  ? "gradient-gold text-black shadow-lg"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Staff canvas */}
      <Card className="bg-card/80 border-border overflow-x-auto">
        <CardContent className="p-4">
        <svg
          ref={svgRef}
          width={totalWidth}
          height={staffHeight}
          onClick={handleStaffClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPosition(null)}
          className="cursor-crosshair"
        >
          {renderPlaybackIndicator()}
          {renderStaff()}
          {renderClef()}
          {renderTimeSignature()}
          {renderNotes()}

          {/* Hover preview */}
          {hoveredPosition && !isPlaying && (
            <ellipse
              cx={hoveredPosition.x}
              cy={hoveredPosition.y}
              rx={NOTE_RADIUS + 2}
              ry={NOTE_RADIUS}
              fill="#d4a853"
              opacity="0.4"
            />
          )}
        </svg>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Button
          onClick={playComposition}
          disabled={isPlaying || notes.length === 0}
          className={`${isPlaying ? "bg-gold-dark text-white" : "gradient-gold text-black hover:opacity-90"}`}
        >
          <Play className="w-4 h-4 mr-2" />
          {isPlaying ? "Playing..." : "Play"}
        </Button>
        <Button
          onClick={clearNotes}
          disabled={isPlaying || notes.length === 0}
          variant="secondary"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <h4 className="font-bold font-serif mb-2">How to use</h4>
          <ul className="text-muted-foreground text-sm space-y-1">
            <li>• Click on the staff to add notes</li>
            <li>• Click on an existing note to remove it</li>
            <li>• Select a note duration before placing notes</li>
            <li>• Use the controls to change time signature, key, tempo, and number of measures</li>
            <li>• Press Play to hear your composition</li>
          </ul>
        </CardContent>
      </Card>

      {/* Note count */}
      <div className="text-sm text-muted-foreground">
        {notes.length} note{notes.length !== 1 ? "s" : ""} placed
      </div>
    </div>
  );
}
