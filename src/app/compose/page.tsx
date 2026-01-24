"use client";

import { SheetMusicEditor } from "@/components/composer";
import { useComposerStore } from "@/stores/composerStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PenTool,
  Trash2,
  MousePointer,
  MousePointerClick,
  Play
} from "lucide-react";

export default function ComposePage() {
  const { notes, clearNotes } = useComposerStore();

  return (
    <main className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="outline" className="mb-3 border-gold/30 text-gold">
              <PenTool className="w-3 h-3 mr-1" />
              Sheet Music Editor
            </Badge>
            <h1 className="font-serif text-4xl font-bold text-shadow-gold">Compose</h1>
            <p className="text-muted-foreground mt-1">
              Create your own sheet music
            </p>
          </div>

          {notes.length > 0 && (
            <Button variant="secondary" onClick={clearNotes}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Sheet Music Editor */}
        <SheetMusicEditor />

        {/* Instructions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <MousePointer className="w-4 h-4 text-gold" />
                </div>
                <h4 className="font-bold">Click to Add Notes</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Click anywhere on the staff to add a note. The note will be placed
                at the closest line or space.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <MousePointerClick className="w-4 h-4 text-gold" />
                </div>
                <h4 className="font-bold">Click Notes to Remove</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Click on any existing note to remove it from the score.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Play className="w-4 h-4 text-gold" />
                </div>
                <h4 className="font-bold">Play Your Composition</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Use the play button to hear your composition. The playback will
                highlight each note as it plays.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
