"use client";

type MidiCallback = (note: number, velocity: number, isNoteOn: boolean) => void;

let midiAccess: MIDIAccess | null = null;
let callbacks: MidiCallback[] = [];
let connectedDevices: string[] = [];

/**
 * Initialize Web MIDI API and set up listeners
 */
export async function initMidi(): Promise<{
  success: boolean;
  devices: string[];
  error?: string;
}> {
  if (!navigator.requestMIDIAccess) {
    return {
      success: false,
      devices: [],
      error: "Web MIDI API not supported in this browser"
    };
  }

  try {
    midiAccess = await navigator.requestMIDIAccess();

    // Set up listeners for all connected MIDI inputs
    connectedDevices = [];
    midiAccess.inputs.forEach((input) => {
      connectedDevices.push(input.name || "Unknown MIDI Device");
      input.onmidimessage = handleMidiMessage;
    });

    // Listen for new devices being connected
    midiAccess.onstatechange = (event) => {
      const port = event.port;
      if (port && port.type === "input") {
        if (port.state === "connected") {
          (port as MIDIInput).onmidimessage = handleMidiMessage;
          if (!connectedDevices.includes(port.name || "Unknown")) {
            connectedDevices.push(port.name || "Unknown MIDI Device");
          }
        } else if (port.state === "disconnected") {
          connectedDevices = connectedDevices.filter(d => d !== port.name);
        }
        // Notify callbacks of state change
        notifyStateChange();
      }
    };

    return {
      success: true,
      devices: connectedDevices
    };
  } catch (error) {
    return {
      success: false,
      devices: [],
      error: error instanceof Error ? error.message : "Failed to access MIDI"
    };
  }
}

/**
 * Handle incoming MIDI messages
 */
function handleMidiMessage(event: MIDIMessageEvent) {
  if (!event.data) return;
  const [status, note, velocity] = Array.from(event.data);

  // Note On: 0x90-0x9F (144-159)
  // Note Off: 0x80-0x8F (128-143)
  const messageType = status & 0xF0;

  if (messageType === 0x90) {
    // Note On (velocity 0 is treated as Note Off)
    const isNoteOn = velocity > 0;
    callbacks.forEach(cb => cb(note, velocity, isNoteOn));
  } else if (messageType === 0x80) {
    // Note Off
    callbacks.forEach(cb => cb(note, velocity, false));
  }
}

/**
 * Subscribe to MIDI note events
 */
export function onMidiNote(callback: MidiCallback): () => void {
  callbacks.push(callback);

  // Return unsubscribe function
  return () => {
    callbacks = callbacks.filter(cb => cb !== callback);
  };
}

/**
 * Get list of connected MIDI devices
 */
export function getConnectedDevices(): string[] {
  return [...connectedDevices];
}

/**
 * Check if MIDI is available and initialized
 */
export function isMidiAvailable(): boolean {
  return midiAccess !== null;
}

// State change listeners
let stateChangeListeners: (() => void)[] = [];

export function onMidiStateChange(callback: () => void): () => void {
  stateChangeListeners.push(callback);
  return () => {
    stateChangeListeners = stateChangeListeners.filter(cb => cb !== callback);
  };
}

function notifyStateChange() {
  stateChangeListeners.forEach(cb => cb());
}
