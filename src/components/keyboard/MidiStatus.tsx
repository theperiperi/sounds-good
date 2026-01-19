"use client";

import { useEffect, useState } from "react";
import { initMidi, getConnectedDevices, onMidiStateChange } from "@/lib/midi/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, WifiOff, Keyboard, AlertCircle } from "lucide-react";

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

    const unsubscribe = onMidiStateChange(() => {
      const currentDevices = getConnectedDevices();
      setDevices(currentDevices);
      setStatus(currentDevices.length > 0 ? "connected" : "no-devices");
    });

    return unsubscribe;
  }, []);

  if (status === "loading") {
    return (
      <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
        Checking MIDI...
      </Badge>
    );
  }

  if (status === "unsupported") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
              <AlertCircle className="w-3 h-3 mr-1.5" />
              MIDI not supported
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Your browser doesn&apos;t support Web MIDI API</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (status === "no-devices") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-500">
              <WifiOff className="w-3 h-3 mr-1.5" />
              No MIDI device
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Connect a MIDI keyboard for the best experience</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className="border-gold/30 text-gold">
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse mr-1.5" />
            <Keyboard className="w-3 h-3 mr-1.5" />
            {devices[0]}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>MIDI device connected and ready</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
