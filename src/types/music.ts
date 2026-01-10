export interface Note {
  midi: number;
  name: string;
  octave: number;
  isBlack: boolean;
}

export interface PlayedNote extends Note {
  time: number;
  duration: number;
  velocity: number;
  finger?: 1 | 2 | 3 | 4 | 5;
  hand: "left" | "right";
}

export type Hand = "left" | "right" | "both";

export interface KeyboardState {
  activeKeys: Set<number>;
  pressKey: (midi: number) => void;
  releaseKey: (midi: number) => void;
}
