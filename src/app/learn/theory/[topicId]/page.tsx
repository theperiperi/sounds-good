"use client";

import { use } from "react";
import Link from "next/link";
import { musicTheoryTopics } from "@/data/courses";
import { notFound } from "next/navigation";
import {
  CircleOfFifths,
  IntervalVisualizer,
  ScaleVisualizer,
  ChordBuilder,
  ChordProgressionPlayer,
  RhythmVisualizer,
} from "@/components/theory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Target,
  Link2,
  Music2,
  Timer,
  Ruler,
  Music
} from "lucide-react";

const topicIcons: Record<string, React.ElementType> = {
  "circle-of-fifths": Target,
  "chord-progressions": Link2,
  "scales-modes": Music2,
  "rhythm-time": Timer,
  "intervals": Ruler,
  "harmony": Music,
};

const topicDescriptions: Record<string, { intro: string; sections: { heading: string; content: string }[] }> = {
  "circle-of-fifths": {
    intro: "The Circle of Fifths is your roadmap to understanding key relationships, chord progressions, and modulation in music.",
    sections: [
      {
        heading: "How to Use This Tool",
        content: "Click any key on the wheel to select it. The wheel will rotate to place your selected key at the top. You'll see the key signature, relative minor, and closely related keys."
      },
      {
        heading: "Moving Around the Circle",
        content: "Moving clockwise (C → G → D → A...) adds sharps. Moving counter-clockwise (C → F → Bb → Eb...) adds flats. Adjacent keys on the circle sound good together - they share many common notes."
      },
      {
        heading: "The Inner Circle",
        content: "The inner ring shows relative minor keys. Each minor key shares the same key signature as its relative major. For example, A minor and C major both have no sharps or flats."
      }
    ]
  },
  "chord-progressions": {
    intro: "Chord progressions are the backbone of songs. Learn the most common patterns used in pop, rock, jazz, and classical music.",
    sections: [
      {
        heading: "Understanding Roman Numerals",
        content: "Roman numerals show which scale degree a chord is built on. Uppercase (I, IV, V) = major chords. Lowercase (ii, iii, vi) = minor chords. This lets you play progressions in any key."
      },
      {
        heading: "Try Different Progressions",
        content: "Select a progression above to hear how it sounds. Notice how some feel resolved and complete, while others create tension or emotion. The same progression is used in countless songs."
      }
    ]
  },
  "scales-modes": {
    intro: "Scales are the building blocks of melody. Each scale has its own unique character and sound.",
    sections: [
      {
        heading: "Scale Degrees",
        content: "The numbers on the keyboard show scale degrees. The root (1) is your home base. Other degrees create different tensions and resolutions relative to it. Flats (b) indicate lowered notes compared to the major scale."
      },
      {
        heading: "Finding the Right Scale",
        content: "Major and minor are the fundamentals. Pentatonic scales are great for improvisation - they have no 'wrong' notes. Blues adds the 'blue note' for that characteristic sound. Modes each have unique flavors for different moods."
      }
    ]
  },
  "intervals": {
    intro: "Intervals are the distance between two notes - the building blocks of melody and harmony. Learn to recognize them by ear.",
    sections: [
      {
        heading: "Melodic vs Harmonic",
        content: "Melodic intervals are notes played one after another (like in a melody). Harmonic intervals are notes played together (like in a chord). Try both buttons to hear the difference."
      },
      {
        heading: "Remembering Intervals",
        content: "Each interval has famous songs associated with it. A Perfect 5th sounds like the Star Wars theme. A Perfect 4th is 'Here Comes the Bride'. These associations help you recognize intervals by ear."
      }
    ]
  },
  "harmony": {
    intro: "Harmony is the art of combining notes into chords. Build any chord and hear how different chord types create different emotions.",
    sections: [
      {
        heading: "Building Chords",
        content: "Click any note on the keyboard or buttons to set the root. Then choose a chord type to hear and see the full chord. Try different combinations to explore the sounds."
      },
      {
        heading: "Chord Character",
        content: "Major chords sound happy and bright. Minor chords sound sad or serious. Diminished chords create tension. Seventh chords add jazz sophistication. Each type has its place in music."
      }
    ]
  },
  "rhythm-time": {
    intro: "Rhythm is the heartbeat of music. Understanding time signatures and note values is essential for reading and playing music.",
    sections: [
      {
        heading: "Time Signatures",
        content: "The top number tells you how many beats per measure. The bottom tells you what note gets one beat. 4/4 means 4 quarter-note beats per measure. 3/4 means 3 quarter-note beats (waltz time)."
      },
      {
        heading: "Note Values",
        content: "Whole note = 4 beats. Half note = 2 beats. Quarter note = 1 beat. Each division halves the duration. Dots add half the note's value. Ties connect notes across bar lines."
      },
      {
        heading: "Tempo",
        content: "Tempo is speed, measured in BPM (beats per minute). Largo is slow (~50 BPM), Andante is walking pace (~80 BPM), Allegro is fast (~120 BPM), Presto is very fast (~180 BPM)."
      }
    ]
  }
};

function getInteractiveComponent(topicId: string) {
  switch (topicId) {
    case "circle-of-fifths":
      return <CircleOfFifths />;
    case "chord-progressions":
      return <ChordProgressionPlayer />;
    case "scales-modes":
      return <ScaleVisualizer />;
    case "intervals":
      return <IntervalVisualizer />;
    case "harmony":
      return <ChordBuilder />;
    case "rhythm-time":
      return <RhythmVisualizer />;
    default:
      return null;
  }
}

export default function TheoryTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = use(params);
  const topic = musicTheoryTopics.find((t) => t.id === topicId);
  const description = topicDescriptions[topicId];

  if (!topic || !description) {
    notFound();
  }

  const Icon = topicIcons[topicId] || Music;
  const interactiveComponent = getInteractiveComponent(topicId);

  return (
    <main className="min-h-[calc(100vh-4rem)] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Learn
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-gold flex items-center justify-center shadow-glow-gold">
            <Icon className="w-10 h-10 text-black" />
          </div>
          <h1 className="font-serif text-4xl font-bold mb-4 text-shadow-gold">{topic.title}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {description.intro}
          </p>
        </div>

        {/* Interactive component */}
        {interactiveComponent && (
          <div className="mb-12">
            {interactiveComponent}
          </div>
        )}

        {/* Explanation sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {description.sections.map((section, index) => (
            <Card key={index} className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-lg">{section.heading}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Other topics */}
        <Separator className="mb-12" />
        <div>
          <h3 className="font-serif text-xl font-bold mb-6">Explore More Topics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {musicTheoryTopics
              .filter((t) => t.id !== topicId)
              .map((t) => {
                const TopicIcon = topicIcons[t.id] || Music;
                return (
                  <Link
                    key={t.id}
                    href={`/learn/theory/${t.id}`}
                    className="group"
                  >
                    <Card className="h-full bg-card/50 border-border hover:border-gold/30 transition-all hover:shadow-glow-gold-sm">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                          <TopicIcon className="w-6 h-6 text-gold" />
                        </div>
                        <h4 className="font-medium text-sm">{t.title}</h4>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </main>
  );
}
