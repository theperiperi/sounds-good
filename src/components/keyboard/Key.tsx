"use client";

import { motion } from "framer-motion";
import { Note } from "@/types/music";

interface KeyProps {
  note: Note;
  isActive: boolean;
  isHighlighted?: boolean;
  highlightColor?: string;
  isWrong?: boolean;
  finger?: number;
  showLabel?: boolean;
  onPress: (midi: number) => void;
  onRelease: (midi: number) => void;
}

export function Key({
  note,
  isActive,
  isHighlighted = false,
  highlightColor,
  isWrong = false,
  finger,
  showLabel = true,
  onPress,
  onRelease,
}: KeyProps) {
  const isBlack = note.isBlack;

  const baseClasses = isBlack
    ? "absolute w-8 h-24 -ml-4 z-10 rounded-b-md shadow-lg flex flex-col items-center justify-end pb-2"
    : "relative w-12 h-40 rounded-b-md shadow-md border border-gray-200 flex flex-col items-center justify-between py-2";

  // Determine background color
  let bgColor = isBlack ? "bg-gray-900" : "bg-white";

  if (isWrong) {
    bgColor = "bg-red-500";
  } else if (isActive) {
    bgColor = isBlack ? "bg-indigo-600" : "bg-indigo-400";
  } else if (isHighlighted && highlightColor) {
    // Custom highlight color (used for left/right hand distinction)
    bgColor = "";
  } else if (isHighlighted) {
    bgColor = isBlack ? "bg-indigo-400" : "bg-indigo-200";
  }

  // Custom style for highlight color
  const customStyle = isHighlighted && highlightColor && !isActive && !isWrong
    ? { backgroundColor: highlightColor }
    : undefined;

  return (
    <motion.button
      className={`${baseClasses} ${bgColor} select-none touch-none transition-colors`}
      style={customStyle}
      onMouseDown={() => onPress(note.midi)}
      onMouseUp={() => onRelease(note.midi)}
      onMouseLeave={() => onRelease(note.midi)}
      onTouchStart={(e) => {
        e.preventDefault();
        onPress(note.midi);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onRelease(note.midi);
      }}
      whileTap={{ scale: 0.98 }}
      animate={{
        y: isActive ? 2 : 0,
      }}
      transition={{ duration: 0.05 }}
    >
      {/* Finger number at top */}
      {finger && (
        <span
          className={`text-sm font-bold ${
            isBlack || isActive || isHighlighted || isWrong
              ? "text-white"
              : "text-gray-700"
          }`}
        >
          {finger}
        </span>
      )}

      {/* Spacer */}
      {!finger && <span />}

      {/* Note label at bottom */}
      {showLabel && !isBlack && (
        <span
          className={`text-xs font-medium ${
            isActive || isHighlighted || isWrong ? "text-white" : "text-gray-400"
          }`}
        >
          {note.name}
        </span>
      )}
    </motion.button>
  );
}
