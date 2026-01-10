"use client";

import { useEffect, useState } from "react";
import { initMidi, getConnectedDevices, onMidiStateChange } from "@/lib/midi/input";

export function MidiStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "no-devices" | "unsupported">("loading");
  const [devices, setDevices] = useState<string[]>([]);

  useEffect(() => {
    async function init() {
      const result = await initMidi();

      if (!result.success) {
        setStatus("unsupported");
        return;
      }

      setDevices(result.devices);
      setStatus(result.devices.length > 0 ? "connected" : "no-devices");
    }

    init();

    // Listen for device changes
    const unsubscribe = onMidiStateChange(() => {
      const currentDevices = getConnectedDevices();
      setDevices(currentDevices);
      setStatus(currentDevices.length > 0 ? "connected" : "no-devices");
    });

    return unsubscribe;
  }, []);

  if (status === "loading") {
    return <span className="text-gray-500 text-sm">Checking MIDI...</span>;
  }

  if (status === "unsupported") {
    return <span className="text-gray-500 text-sm">MIDI not supported</span>;
  }

  if (status === "no-devices") {
    return <span className="text-yellow-500 text-sm">No MIDI device</span>;
  }

  return (
    <span className="text-green-500 text-sm flex items-center gap-2">
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      {devices[0]}
    </span>
  );
}
