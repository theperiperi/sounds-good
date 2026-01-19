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

  // Premium 3D key styling
  const baseClasses = isBlack
    ? "absolute w-8 h-24 -ml-4 z-10 rounded-b-md flex flex-col items-center justify-end pb-2"
    : "relative w-12 h-40 rounded-b-lg flex flex-col items-center justify-between py-2";

  // 3D effect classes with gradients and shadows
  const getKeyStyle = () => {
    if (isWrong) {
      return isBlack
        ? "bg-gradient-to-b from-red-500 to-red-700 shadow-[0_4px_0_0_#991b1b,inset_0_1px_0_rgba(255,255,255,0.1)]"
        : "bg-gradient-to-b from-red-400 to-red-500 shadow-[0_4px_0_0_#dc2626,inset_0_1px_0_rgba(255,255,255,0.3)]";
    }

    if (isActive) {
      return isBlack
        ? "bg-gradient-to-b from-gold to-gold-dark shadow-[0_2px_0_0_#8b6914,inset_0_1px_0_rgba(255,255,255,0.2)] glow-gold"
        : "bg-gradient-to-b from-gold-light to-gold shadow-[0_2px_0_0_#b8860b,inset_0_1px_0_rgba(255,255,255,0.4)] glow-gold";
    }

    if (isHighlighted && highlightColor) {
      return "";
    }

    if (isHighlighted) {
      return isBlack
        ? "bg-gradient-to-b from-gold to-gold-dark shadow-[0_4px_0_0_#8b6914,inset_0_1px_0_rgba(255,255,255,0.2)]"
        : "bg-gradient-to-b from-gold-light to-gold shadow-[0_4px_0_0_#b8860b,inset_0_1px_0_rgba(255,255,255,0.4)]";
    }

    return isBlack
      ? "bg-gradient-to-b from-gray-800 to-gray-900 shadow-[0_4px_0_0_#1f2937,inset_0_1px_0_rgba(255,255,255,0.05)] border border-gray-700"
      : "bg-gradient-to-b from-white to-gray-100 shadow-[0_4px_0_0_#d1d5db,inset_0_1px_0_rgba(255,255,255,1)] border border-gray-200";
  };

  // Custom style for highlight color
  const customStyle =
    isHighlighted && highlightColor && !isActive && !isWrong
      ? {
          backgroundColor: highlightColor,
          boxShadow: `0 4px 0 0 ${highlightColor}88, inset 0 1px 0 rgba(255,255,255,0.2)`,
        }
      : undefined;

  return (
    <motion.button
      className={`${baseClasses} ${getKeyStyle()} select-none touch-none transition-all duration-75`}
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
        boxShadow: isActive
          ? isBlack
            ? "0 2px 0 0 #1f2937, inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 2px 0 0 #d1d5db, inset 0 1px 0 rgba(255,255,255,1)"
          : undefined,
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
            isActive || isHighlighted
              ? "text-black"
              : isWrong
              ? "text-white"
              : "text-gray-400"
          }`}
        >
          {note.name}
        </span>
      )}
    </motion.button>
  );
}
