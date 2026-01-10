"use client";

import { Keyboard } from "@/components/keyboard/Keyboard";
import { MidiStatus } from "@/components/keyboard/MidiStatus";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Free Play</h1>
        <p className="text-gray-400">Practice freely on the keyboard</p>
      </div>

      <div className="mb-4">
        <MidiStatus />
      </div>

      <Keyboard />

      <div className="mt-8 text-center space-y-2">
        <p className="text-sm text-gray-500">
          Click keys or use your laptop keyboard (A-L for white keys, W-P for black)
        </p>
        <p className="text-sm text-gray-500">
          Connect a MIDI keyboard for the full experience
        </p>
      </div>
    </main>
  );
}
