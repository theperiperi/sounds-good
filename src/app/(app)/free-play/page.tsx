"use client";

import { Keyboard } from "@/components/keyboard/Keyboard";
import { MidiStatus } from "@/components/keyboard/MidiStatus";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Keyboard as KeyboardIcon, Info } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <Badge variant="outline" className="mb-4 border-gold/30 text-gold">
          <KeyboardIcon className="w-3 h-3 mr-1" />
          Free Practice Mode
        </Badge>
        <h1 className="font-serif text-5xl font-bold mb-3 text-shadow-gold">
          Free Play
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Practice freely on the keyboard. Perfect your technique at your own pace.
        </p>
      </div>

      <div className="mb-6">
        <MidiStatus />
      </div>

      <Card className="bg-card/50 border-border shadow-premium-lg overflow-visible">
        <CardContent className="p-6 overflow-visible">
          <Keyboard />
        </CardContent>
      </Card>

      <div className="mt-8 text-center space-y-3 max-w-lg">
        <div className="flex items-start gap-2 text-muted-foreground text-sm bg-secondary/50 rounded-lg px-4 py-3">
          <Info className="w-4 h-4 mt-0.5 text-gold flex-shrink-0" />
          <p>
            Click keys or use your laptop keyboard (A-L for white keys, W-P for black).
            Connect a MIDI keyboard for the full experience.
          </p>
        </div>
      </div>
    </main>
  );
}
