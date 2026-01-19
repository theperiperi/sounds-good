// Lesson content with correct musical data for each lesson

export interface LessonContent {
  id: string;
  // Notes to highlight on the keyboard (MIDI numbers)
  highlightedNotes?: number[];
  // Detailed content sections
  content: {
    introduction: string;
    keyPoints: string[];
    practice?: string;
    tip?: string;
  };
  // For scale/chord lessons, define the structure
  scale?: {
    name: string;
    root: number; // MIDI number
    pattern: number[]; // Intervals from root
    notes: string[]; // Note names
  };
  chord?: {
    name: string;
    root: number;
    intervals: number[];
    notes: string[];
  };
}

// Helper function to generate scale notes from root and pattern
function generateScaleNotes(root: number, pattern: number[]): number[] {
  return pattern.map(interval => root + interval);
}

// Scale patterns (intervals from root)
const SCALE_PATTERNS = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10, 12],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11, 12],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11, 12],
  pentatonicMajor: [0, 2, 4, 7, 9, 12],
  pentatonicMinor: [0, 3, 5, 7, 10, 12],
  blues: [0, 3, 5, 6, 7, 10, 12],
};

// Chord patterns (intervals from root)
const CHORD_PATTERNS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
};

// MIDI note reference: C4 = 60, D4 = 62, E4 = 64, F4 = 65, G4 = 67, A4 = 69, B4 = 71, C5 = 72
// D4 = 62, E4 = 64, F4 = 65, G4 = 67, A4 = 69, Bb4 = 70, C5 = 72, D5 = 74

export const lessonContents: Record<string, LessonContent> = {
  // Grade 1 - Getting Started
  "g1-intro": {
    id: "g1-intro",
    content: {
      introduction: "Welcome to your piano journey! The piano is one of the most versatile and rewarding instruments to learn. With 88 keys spanning over 7 octaves, it offers an incredible range of musical expression.",
      keyPoints: [
        "The piano keyboard has white and black keys arranged in a repeating pattern",
        "White keys are the natural notes: A, B, C, D, E, F, G",
        "Black keys are sharps (#) or flats (b) - the same note with two names",
        "The pattern repeats every 12 keys (called an octave)",
        "Middle C is the central reference point on the keyboard"
      ],
      tip: "Take your time to explore the keyboard. Press different keys and listen to how high and low notes sound different."
    }
  },

  "g1-posture": {
    id: "g1-posture",
    content: {
      introduction: "Good posture and hand position are fundamental to playing piano well. They prevent injury and allow for better control and expression.",
      keyPoints: [
        "Sit at the center of the keyboard with your body facing Middle C",
        "Your forearms should be parallel to the floor",
        "Keep your wrists level - not drooping or raised",
        "Curve your fingers naturally, as if holding a ball",
        "Your thumb should rest on its side, not flat",
        "Keep your shoulders relaxed and down"
      ],
      tip: "Imagine holding a small ball or bubble in your hand - this is the natural curve your fingers should maintain."
    }
  },

  "g1-keyboard-layout": {
    id: "g1-keyboard-layout",
    highlightedNotes: [60, 62, 64, 65, 67, 69, 71, 72], // One octave from C4
    content: {
      introduction: "Understanding the keyboard layout is essential. The pattern of black and white keys helps you navigate and find any note quickly.",
      keyPoints: [
        "Black keys come in groups of 2 and 3",
        "C is always immediately left of the group of 2 black keys",
        "F is always immediately left of the group of 3 black keys",
        "The musical alphabet goes A-B-C-D-E-F-G, then repeats",
        "Each repetition of the pattern (C to C) is called an octave",
        "Higher notes are to the right, lower notes to the left"
      ],
      practice: "Find all the C notes on the keyboard by looking for the groups of 2 black keys.",
      tip: "Use the black key groups as landmarks - they never change position!"
    }
  },

  "g1-middle-c": {
    id: "g1-middle-c",
    highlightedNotes: [60], // Middle C only
    content: {
      introduction: "Middle C is the most important reference point on the piano. It's located near the center of the keyboard and is where many beginners start learning.",
      keyPoints: [
        "Middle C is the C closest to the middle of the keyboard",
        "On a standard 88-key piano, it's the 4th C from the left",
        "It sits on a ledger line below the treble staff",
        "It sits on a ledger line above the bass staff",
        "Middle C is MIDI note 60 in digital music"
      ],
      practice: "Find Middle C, then play it with your right hand thumb (finger 1).",
      tip: "Middle C is usually right in front of the piano's brand name on the fallboard."
    }
  },

  // Grade 1 - Note Names
  "g1-cde": {
    id: "g1-cde",
    highlightedNotes: [60, 62, 64], // C, D, E
    content: {
      introduction: "Let's learn your first three notes: C, D, and E. These form the beginning of the C major scale and are played on white keys only.",
      keyPoints: [
        "C is immediately left of the 2 black keys",
        "D is between the 2 black keys",
        "E is immediately right of the 2 black keys",
        "Play C with thumb (1), D with index (2), E with middle (3)",
        "These three notes are called a 'C position' starting point"
      ],
      practice: "Play C-D-E ascending, then E-D-C descending. Keep your hand relaxed and fingers curved."
    }
  },

  "g1-fgab": {
    id: "g1-fgab",
    highlightedNotes: [65, 67, 69, 71], // F, G, A, B
    content: {
      introduction: "Now let's learn F, G, A, and B to complete the musical alphabet. Combined with C, D, and E, you now know all the white keys!",
      keyPoints: [
        "F is immediately left of the 3 black keys",
        "G is between the first two of the 3 black keys",
        "A is between the last two of the 3 black keys",
        "B is immediately right of the 3 black keys",
        "The pattern then repeats with another C"
      ],
      practice: "Play all seven notes: C-D-E-F-G-A-B, then back down B-A-G-F-E-D-C."
    }
  },

  "g1-note-quiz": {
    id: "g1-note-quiz",
    highlightedNotes: [60, 62, 64, 65, 67, 69, 71], // All white keys in one octave
    content: {
      introduction: "Time to test your note recognition! Being able to quickly identify notes is essential for reading music and playing fluently.",
      keyPoints: [
        "Use the black key groups to find notes quickly",
        "C, D, E are around the 2 black keys",
        "F, G, A, B are around the 3 black keys",
        "Practice naming notes without looking at your hands"
      ],
      practice: "Close your eyes, touch a white key, then name it before looking."
    }
  },

  // Grade 1 - Basic Rhythm
  "g1-pulse": {
    id: "g1-pulse",
    content: {
      introduction: "Music happens in time, and the pulse (or beat) is the steady heartbeat that keeps music organized. Learning to feel and maintain a steady pulse is fundamental to all music-making.",
      keyPoints: [
        "The pulse is the steady beat underlying all music",
        "It's like a musical heartbeat that never stops",
        "Most music groups pulses into measures (bars)",
        "Common groupings are 2, 3, or 4 beats per measure",
        "A metronome can help you practice keeping steady time"
      ],
      practice: "Tap your foot or clap along to your favorite song, finding the steady pulse.",
      tip: "The tempo (speed) of the pulse can vary, but it should stay consistent within a piece."
    }
  },

  "g1-note-values": {
    id: "g1-note-values",
    content: {
      introduction: "Different notes are held for different lengths of time. Understanding note values helps you read and play rhythms correctly.",
      keyPoints: [
        "Whole note = 4 beats (empty oval)",
        "Half note = 2 beats (empty oval with stem)",
        "Quarter note = 1 beat (filled oval with stem)",
        "Eighth note = 1/2 beat (filled with stem and flag)",
        "Two eighth notes equal one quarter note",
        "Notes can be connected with ties to extend their duration"
      ],
      practice: "Clap quarter notes while counting 1-2-3-4, then try half notes (clap on 1 and 3)."
    }
  },

  "g1-rhythm-exercise": {
    id: "g1-rhythm-exercise",
    content: {
      introduction: "Reading rhythms is a skill that improves with practice. Let's work on recognizing and performing different rhythm patterns.",
      keyPoints: [
        "Count out loud while clapping - '1-2-3-4'",
        "For eighth notes, count '1-and-2-and-3-and-4-and'",
        "Keep the pulse steady even when rhythms change",
        "Practice difficult rhythms slowly before speeding up"
      ],
      practice: "Try clapping: quarter-quarter-half (1-2-3-4), then quarter-quarter-quarter-quarter."
    }
  },

  // Grade 1 - First Scales
  "g1-c-major-rh": {
    id: "g1-c-major-rh",
    highlightedNotes: [60, 62, 64, 65, 67], // C major 5-finger position
    scale: {
      name: "C Major (5-finger)",
      root: 60,
      pattern: [0, 2, 4, 5, 7],
      notes: ["C", "D", "E", "F", "G"]
    },
    content: {
      introduction: "The C major scale is the most fundamental scale in Western music. Starting with a 5-finger position, you'll learn the foundation for all major scales.",
      keyPoints: [
        "C major uses only white keys",
        "The 5-finger pattern: C-D-E-F-G",
        "Fingering: 1-2-3-4-5 (thumb to pinky)",
        "Keep your hand position stable",
        "Each finger plays one note"
      ],
      practice: "Play C-D-E-F-G ascending, then G-F-E-D-C descending. Use the correct fingering."
    }
  },

  "g1-c-major-lh": {
    id: "g1-c-major-lh",
    highlightedNotes: [48, 50, 52, 53, 55], // C major 5-finger position (lower octave)
    scale: {
      name: "C Major Left Hand (5-finger)",
      root: 48,
      pattern: [0, 2, 4, 5, 7],
      notes: ["C", "D", "E", "F", "G"]
    },
    content: {
      introduction: "Now let's learn the same C major pattern with your left hand. The notes are the same, but the fingering is mirrored.",
      keyPoints: [
        "Left hand starts with pinky (5) on C",
        "Fingering: 5-4-3-2-1 going up",
        "The pattern is the same: C-D-E-F-G",
        "Practice hands separately first",
        "Left hand typically plays in a lower register"
      ],
      practice: "Play C-D-E-F-G with left hand, then descending G-F-E-D-C."
    }
  },

  "g1-scale-practice": {
    id: "g1-scale-practice",
    highlightedNotes: [60, 62, 64, 65, 67], // C major 5-finger position
    content: {
      introduction: "Regular scale practice builds technique, finger strength, and familiarity with key patterns. Let's establish good practice habits.",
      keyPoints: [
        "Practice slowly with correct fingering",
        "Listen for even tone on each note",
        "Keep your wrist relaxed and level",
        "Practice hands separately before together",
        "Use a metronome for steady tempo"
      ],
      practice: "Play the C major 5-finger scale 5 times each hand, focusing on evenness."
    }
  },

  // Grade 2 - New Key Signatures
  "g2-g-major": {
    id: "g2-g-major",
    highlightedNotes: [67, 69, 71, 72, 74, 76, 78, 79], // G major scale
    scale: {
      name: "G Major",
      root: 67,
      pattern: [0, 2, 4, 5, 7, 9, 11, 12],
      notes: ["G", "A", "B", "C", "D", "E", "F#", "G"]
    },
    content: {
      introduction: "G major is often the second scale learned because it has just one sharp (F#). This introduces the concept of key signatures.",
      keyPoints: [
        "G major has one sharp: F#",
        "Play F# instead of F natural throughout",
        "The scale pattern: G-A-B-C-D-E-F#-G",
        "F# is the black key between F and G",
        "Right hand fingering: 1-2-3-1-2-3-4-5"
      ],
      practice: "Play G major ascending and descending, remembering to play F# every time."
    }
  },

  "g2-f-major": {
    id: "g2-f-major",
    highlightedNotes: [65, 67, 69, 70, 72, 74, 76, 77], // F major scale
    scale: {
      name: "F Major",
      root: 65,
      pattern: [0, 2, 4, 5, 7, 9, 11, 12],
      notes: ["F", "G", "A", "Bb", "C", "D", "E", "F"]
    },
    content: {
      introduction: "F major introduces flats. It has one flat (Bb), which is the black key between A and B.",
      keyPoints: [
        "F major has one flat: Bb",
        "Play Bb instead of B natural throughout",
        "The scale pattern: F-G-A-Bb-C-D-E-F",
        "Bb is the black key between A and B",
        "Right hand fingering: 1-2-3-4-1-2-3-4"
      ],
      practice: "Play F major ascending and descending, making sure to use Bb every time."
    }
  },

  "g2-key-signatures": {
    id: "g2-key-signatures",
    content: {
      introduction: "Key signatures tell you which notes to play sharp or flat throughout a piece. Understanding them makes reading music much easier.",
      keyPoints: [
        "Key signature appears at the beginning of each staff line",
        "Sharps/flats apply to ALL notes of that name in the piece",
        "Order of sharps: F-C-G-D-A-E-B",
        "Order of flats: B-E-A-D-G-C-F (reverse of sharps)",
        "C major and A minor have no sharps or flats"
      ],
      tip: "The order of sharps spells 'Father Charles Goes Down And Ends Battle'"
    }
  },

  // Grade 2 - Intervals
  "g2-2nds-3rds": {
    id: "g2-2nds-3rds",
    highlightedNotes: [60, 62, 64], // C, D, E for demonstrating intervals
    content: {
      introduction: "Intervals measure the distance between two notes. Seconds and thirds are the smallest and most common intervals you'll encounter.",
      keyPoints: [
        "A 2nd is the distance of one step (like C to D)",
        "A 3rd is the distance of a skip (like C to E)",
        "2nds are adjacent notes on the staff",
        "3rds skip one line or space",
        "Major 2nd = 2 semitones, Minor 2nd = 1 semitone",
        "Major 3rd = 4 semitones, Minor 3rd = 3 semitones"
      ],
      practice: "Play C-D (2nd) and C-E (3rd). Listen to the difference in sound."
    }
  },

  "g2-4ths-5ths": {
    id: "g2-4ths-5ths",
    highlightedNotes: [60, 65, 67], // C, F, G for demonstrating intervals
    content: {
      introduction: "Fourths and fifths are larger intervals that form the basis of many chords and harmonies. The perfect 5th is especially important in music.",
      keyPoints: [
        "A 4th spans 4 letter names (C to F)",
        "A 5th spans 5 letter names (C to G)",
        "Perfect 4th = 5 semitones",
        "Perfect 5th = 7 semitones",
        "The 5th is the most consonant interval after the octave",
        "Power chords in rock music use the root and 5th"
      ],
      practice: "Play C-F (4th) and C-G (5th). Notice how open and stable the 5th sounds."
    }
  },

  "g2-interval-ear": {
    id: "g2-interval-ear",
    content: {
      introduction: "Training your ear to recognize intervals is one of the most valuable skills a musician can develop. It helps with playing by ear and transcribing music.",
      keyPoints: [
        "Each interval has a unique sound character",
        "Associate intervals with song beginnings",
        "Minor 2nd: 'Jaws' theme",
        "Major 3rd: 'Kumbaya'",
        "Perfect 4th: 'Here Comes the Bride'",
        "Perfect 5th: 'Star Wars' opening"
      ],
      practice: "Have someone play random intervals while you identify them by ear."
    }
  },

  // Grade 2 - Introduction to Chords
  "g2-triads": {
    id: "g2-triads",
    highlightedNotes: [60, 64, 67], // C major triad
    chord: {
      name: "C Major Triad",
      root: 60,
      intervals: [0, 4, 7],
      notes: ["C", "E", "G"]
    },
    content: {
      introduction: "A triad is a chord made of three notes stacked in thirds. Triads are the building blocks of harmony in Western music.",
      keyPoints: [
        "Triads have 3 notes: root, third, and fifth",
        "Major triad: root + major 3rd + perfect 5th",
        "Minor triad: root + minor 3rd + perfect 5th",
        "The root gives the chord its name",
        "Triads can be inverted (notes rearranged)"
      ],
      practice: "Play C-E-G together. This is a C major triad."
    }
  },

  "g2-c-chord": {
    id: "g2-c-chord",
    highlightedNotes: [60, 64, 67], // C major chord
    chord: {
      name: "C Major",
      root: 60,
      intervals: [0, 4, 7],
      notes: ["C", "E", "G"]
    },
    content: {
      introduction: "The C major chord is the most fundamental chord on the piano. It uses all white keys and is the starting point for learning harmony.",
      keyPoints: [
        "C major chord: C-E-G",
        "All white keys - no sharps or flats",
        "Fingering: 1-3-5 (thumb, middle, pinky)",
        "The C is the root, E is the third, G is the fifth",
        "Listen for the bright, happy sound of major"
      ],
      practice: "Play C-E-G together with proper fingering. Hold for 4 counts."
    }
  },

  "g2-g-f-chords": {
    id: "g2-g-f-chords",
    highlightedNotes: [65, 69, 72, 67, 71, 74], // F and G major chords
    content: {
      introduction: "G major and F major are the other primary chords in the key of C. Together with C major, they form the basis of countless songs.",
      keyPoints: [
        "G major chord: G-B-D",
        "F major chord: F-A-C",
        "These are called the I, IV, and V chords in C major",
        "C = I (tonic), F = IV (subdominant), G = V (dominant)",
        "The I-IV-V progression is the basis of blues and rock"
      ],
      practice: "Play C major, then F major, then G major, then back to C major."
    }
  },

  // Grade 3 - Minor Keys
  "g3-minor-intro": {
    id: "g3-minor-intro",
    content: {
      introduction: "Minor keys have a different, often described as 'sad' or 'emotional' quality compared to major keys. Understanding both is essential for musical expression.",
      keyPoints: [
        "Minor scales have a lowered 3rd degree",
        "This creates a more melancholy sound",
        "Every major key has a relative minor",
        "The relative minor starts on the 6th degree of major",
        "A minor is the relative minor of C major"
      ],
      practice: "Play C major (C-D-E-F-G), then A natural minor (A-B-C-D-E). Hear the difference?"
    }
  },

  "g3-a-minor": {
    id: "g3-a-minor",
    highlightedNotes: [69, 71, 72, 74, 76, 77, 79, 81], // A natural minor
    scale: {
      name: "A Natural Minor",
      root: 69,
      pattern: [0, 2, 3, 5, 7, 8, 10, 12],
      notes: ["A", "B", "C", "D", "E", "F", "G", "A"]
    },
    content: {
      introduction: "A minor is the relative minor of C major. It uses the same notes but starts on A, giving it a completely different character.",
      keyPoints: [
        "A natural minor: A-B-C-D-E-F-G-A",
        "Uses only white keys (like C major)",
        "The pattern: whole-half-whole-whole-half-whole-whole",
        "Starting on A changes the feeling entirely",
        "Right hand fingering: 1-2-3-1-2-3-4-5"
      ],
      practice: "Play A-B-C-D-E-F-G-A ascending, then descending. Notice the minor quality."
    }
  },

  "g3-d-minor": {
    id: "g3-d-minor",
    highlightedNotes: [62, 64, 65, 67, 69, 70, 72, 74], // D natural minor (correct!)
    scale: {
      name: "D Natural Minor",
      root: 62,
      pattern: [0, 2, 3, 5, 7, 8, 10, 12],
      notes: ["D", "E", "F", "G", "A", "Bb", "C", "D"]
    },
    content: {
      introduction: "D minor is the relative minor of F major. It has one flat (Bb) and is one of the most commonly used minor keys in classical and popular music.",
      keyPoints: [
        "D natural minor: D-E-F-G-A-Bb-C-D",
        "Has one flat: Bb",
        "Bb is the black key between A and B",
        "The pattern follows: whole-half-whole-whole-half-whole-whole",
        "D minor is relative to F major (same key signature)"
      ],
      practice: "Play D-E-F-G-A-Bb-C-D ascending, then descending. Remember the Bb!"
    }
  },

  // Grade 3 - Hands Together
  "g3-parallel": {
    id: "g3-parallel",
    highlightedNotes: [48, 50, 52, 53, 55, 60, 62, 64, 65, 67], // Both hands C position
    content: {
      introduction: "Parallel motion is when both hands move in the same direction at the same time. This is often the easiest way to start playing hands together.",
      keyPoints: [
        "Both hands move up or down together",
        "Usually playing the same notes an octave apart",
        "Start with simple 5-finger patterns",
        "Keep both hands synchronized",
        "Listen for even tone between hands"
      ],
      practice: "Play C-D-E-F-G with both hands together, one octave apart."
    }
  },

  "g3-contrary": {
    id: "g3-contrary",
    highlightedNotes: [48, 55, 60, 67], // Contrary motion endpoints
    content: {
      introduction: "Contrary motion is when hands move in opposite directions. This creates interesting harmonic effects and is common in piano music.",
      keyPoints: [
        "One hand goes up while the other goes down",
        "Creates expanding or contracting motion",
        "Common in scale practice and compositions",
        "Requires more concentration than parallel motion"
      ],
      practice: "Starting on Middle C with both thumbs, play outward (right hand up, left hand down)."
    }
  },

  "g3-independence": {
    id: "g3-independence",
    content: {
      introduction: "True hand independence means each hand can play different rhythms and patterns simultaneously. This is essential for more advanced piano music.",
      keyPoints: [
        "Each hand may play different notes and rhythms",
        "The melody is often in the right hand",
        "The left hand often plays accompaniment",
        "Practice each hand separately first",
        "Gradually combine, starting very slowly"
      ],
      practice: "Play a steady quarter note C in left hand while right hand plays the C major scale.",
      tip: "When learning a new piece, always practice hands separately until each part is secure."
    }
  },

  // Grade 4 - Arpeggios
  "g4-arp-intro": {
    id: "g4-arp-intro",
    highlightedNotes: [60, 64, 67, 72], // C major arpeggio
    content: {
      introduction: "Arpeggios are the notes of a chord played one at a time in sequence. They're essential for technique and appear in countless pieces of music.",
      keyPoints: [
        "Arpeggio means 'broken chord'",
        "Notes are played in succession, not together",
        "Can span multiple octaves",
        "Requires smooth thumb-under technique",
        "Arpeggios outline harmony melodically"
      ],
      practice: "Play C-E-G-C ascending, one note at a time with even rhythm."
    }
  },

  "g4-c-arpeggio": {
    id: "g4-c-arpeggio",
    highlightedNotes: [60, 64, 67, 72, 76, 79, 84], // C major arpeggio 2 octaves
    content: {
      introduction: "The C major arpeggio spans two octaves and requires the thumb-under technique to play smoothly.",
      keyPoints: [
        "Right hand fingering: 1-2-3-1-2-3-5",
        "Smooth thumb-under between positions",
        "Keep wrist flexible and relaxed",
        "Practice slowly for even tone",
        "The thumb passes under fingers 2 and 3"
      ],
      practice: "Play C-E-G-C-E-G-C over two octaves, then descend."
    }
  },

  "g4-g-f-arp": {
    id: "g4-g-f-arp",
    highlightedNotes: [67, 71, 74, 79, 65, 69, 72, 77], // G and F arpeggios
    content: {
      introduction: "Learning G major and F major arpeggios builds on your C major technique and prepares you for all major arpeggios.",
      keyPoints: [
        "G major arpeggio: G-B-D-G-B-D-G",
        "F major arpeggio: F-A-C-F-A-C-F",
        "Same fingering principle as C major",
        "Watch for smooth thumb transitions",
        "Practice each hand separately first"
      ],
      practice: "Play G major and F major arpeggios over two octaves."
    }
  },

  // Grade 5 - Upper Intermediate
  "g5-sharp-keys": {
    id: "g5-sharp-keys",
    content: {
      introduction: "The sharp key scales (G, D, A, E, B major) are essential for complete keyboard mastery. Each adds one more sharp to the key signature.",
      keyPoints: [
        "G major: 1 sharp (F#)",
        "D major: 2 sharps (F#, C#)",
        "A major: 3 sharps (F#, C#, G#)",
        "E major: 4 sharps (F#, C#, G#, D#)",
        "B major: 5 sharps (F#, C#, G#, D#, A#)",
        "Remember: sharps are added in the order F-C-G-D-A-E-B"
      ],
      practice: "Practice each scale hands separately, then together at a slow tempo.",
      tip: "The pattern of sharps follows the Circle of Fifths - each new key is a 5th higher."
    }
  },

  "g5-flat-keys": {
    id: "g5-flat-keys",
    content: {
      introduction: "The flat key scales (F, Bb, Eb, Ab, Db major) complete your major scale knowledge. Flats are added in the opposite order from sharps.",
      keyPoints: [
        "F major: 1 flat (Bb)",
        "Bb major: 2 flats (Bb, Eb)",
        "Eb major: 3 flats (Bb, Eb, Ab)",
        "Ab major: 4 flats (Bb, Eb, Ab, Db)",
        "Db major: 5 flats (Bb, Eb, Ab, Db, Gb)",
        "Flats are added in the order B-E-A-D-G-C-F"
      ],
      practice: "Master each flat key scale with proper fingering.",
      tip: "The second-to-last flat in any key signature is the name of the key (except F major)."
    }
  },

  "g5-chromatic": {
    id: "g5-chromatic",
    highlightedNotes: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72], // Chromatic scale
    content: {
      introduction: "The chromatic scale includes all 12 semitones. It's excellent for finger dexterity and appears frequently in classical and jazz music.",
      keyPoints: [
        "Contains all 12 notes within an octave",
        "Every note is a semitone apart",
        "Right hand fingering: 1-3-1-3-1-2-3-1-3-1-3-1-2",
        "Use thumb on white keys, finger 3 on black keys",
        "Keep the hand stable; avoid twisting"
      ],
      practice: "Play the chromatic scale from C to C, ascending and descending, over two octaves."
    }
  },

  "g5-time-signatures": {
    id: "g5-time-signatures",
    content: {
      introduction: "Understanding both simple and compound time signatures is crucial for reading music accurately and feeling rhythms correctly.",
      keyPoints: [
        "Simple time: beat divides into 2 (2/4, 3/4, 4/4)",
        "Compound time: beat divides into 3 (6/8, 9/8, 12/8)",
        "In 6/8, there are 2 beats per measure (each = dotted quarter)",
        "In 9/8, there are 3 beats per measure",
        "In 12/8, there are 4 beats per measure",
        "The feel is different: simple is 'march-like', compound is 'flowing'"
      ],
      tip: "6/8 sounds different from 3/4 even though both have 6 eighth notes per measure."
    }
  },

  "g5-transposition": {
    id: "g5-transposition",
    content: {
      introduction: "Transposition means moving a piece of music to a different key while keeping the same melodic and harmonic relationships.",
      keyPoints: [
        "Transposition preserves the intervals between notes",
        "All notes move by the same distance",
        "Useful for matching vocal ranges or instrument keys",
        "Think in scale degrees rather than absolute pitches",
        "Practice transposing simple melodies by ear first"
      ],
      practice: "Take 'Mary Had a Little Lamb' in C and play it in G, then F.",
      tip: "If you know your scales well, transposition becomes much easier."
    }
  },

  "g5-terms": {
    id: "g5-terms",
    content: {
      introduction: "Italian terms are used universally in music to indicate tempo, dynamics, and expression. Knowing these is essential for musical literacy.",
      keyPoints: [
        "Tempo: Allegro (fast), Andante (walking), Adagio (slow), Presto (very fast)",
        "Dynamics: pp (very soft), p (soft), mp (moderately soft), mf (moderately loud), f (loud), ff (very loud)",
        "Expression: legato (smooth), staccato (detached), dolce (sweetly), espressivo (expressively)",
        "Changes: accelerando (speed up), ritardando (slow down), crescendo (get louder), diminuendo (get softer)"
      ],
      tip: "Create flashcards to memorize these terms - they appear on every music exam!"
    }
  },

  // Grade 6 - Advanced
  "g6-octaves": {
    id: "g6-octaves",
    highlightedNotes: [60, 72, 62, 74, 64, 76], // Octaves
    content: {
      introduction: "Octave technique is essential for powerful, full-sounding passages. A relaxed approach is key to avoiding tension and injury.",
      keyPoints: [
        "Keep the hand firm but wrist loose",
        "Use arm weight rather than finger pressure",
        "The wrist acts as a shock absorber",
        "Practice slowly to build strength gradually",
        "Shake out your hand if you feel any tension",
        "Common fingering: 1-5 for most octaves"
      ],
      practice: "Play octave scales in C major, keeping the wrist relaxed and using arm weight.",
      tip: "If your hand is small, you can sometimes use 1-4 on black keys."
    }
  },

  "g6-double-thirds": {
    id: "g6-double-thirds",
    highlightedNotes: [60, 64, 62, 65, 64, 67], // Double thirds
    content: {
      introduction: "Double thirds create a rich, full texture and develop finger independence. They require careful attention to fingering.",
      keyPoints: [
        "Two notes a third apart played simultaneously",
        "Common fingering patterns: 1-3, 2-4, 3-5",
        "Requires finger substitution for smooth legato",
        "Practice each voice separately first",
        "Listen for even balance between voices",
        "Start very slowly and increase speed gradually"
      ],
      practice: "Play the C major scale in thirds: C-E, D-F, E-G, etc.",
      tip: "Think of it as two melodies happening at once - each needs to be smooth."
    }
  },

  // Grade 7 - Diploma Prep
  "g7-baroque": {
    id: "g7-baroque",
    content: {
      introduction: "The Baroque period (1600-1750) gave us Bach, Handel, and Scarlatti. Understanding its style is crucial for authentic performance.",
      keyPoints: [
        "Ornaments: trills, mordents, turns were essential",
        "Terraced dynamics: sudden changes rather than gradual",
        "Counterpoint: multiple independent melodic lines",
        "Steady tempo was expected (no rubato)",
        "Articulation was generally lighter and more detached",
        "The harpsichord influenced much keyboard writing"
      ],
      tip: "Listen to recordings by harpsichordists to understand the original sound world."
    }
  },

  "g7-classical": {
    id: "g7-classical",
    content: {
      introduction: "The Classical period (1750-1820) featured Mozart, Haydn, and early Beethoven. Clarity, balance, and elegant phrasing define this style.",
      keyPoints: [
        "Clean, clear textures - avoid over-pedaling",
        "Alberti bass: broken chord accompaniment pattern",
        "Grace and elegance over power",
        "Gradual dynamics became more common",
        "Sonata form became the dominant structure",
        "Mozart and Haydn defined piano style of the era"
      ],
      tip: "Think of Classical music as conversation - phrases should have clear questions and answers."
    }
  },

  // Grade 8 - Diploma
  "g8-all-scales": {
    id: "g8-all-scales",
    content: {
      introduction: "At diploma level, you should be able to play all major and minor scales fluently in any rhythm, tempo, or articulation.",
      keyPoints: [
        "All 12 major scales with correct fingering",
        "All harmonic and melodic minor scales",
        "Scales in thirds, sixths, and tenths",
        "Contrary motion scales",
        "Arpeggios in all keys (major, minor, diminished, dominant 7th)",
        "Chromatic scales starting on any note"
      ],
      practice: "Create a daily scale routine covering all keys systematically.",
      tip: "Technical mastery should become automatic so you can focus entirely on musicality."
    }
  },

  "g8-interpretation": {
    id: "g8-interpretation",
    content: {
      introduction: "Musical interpretation is where technical skill meets artistic vision. At this level, you must develop your own voice as a musician.",
      keyPoints: [
        "Study the historical context of pieces you play",
        "Listen to multiple recordings by great pianists",
        "Develop your own interpretive ideas based on the score",
        "Consider the composer's intentions and style",
        "Balance faithfulness to the score with personal expression",
        "Technical choices should serve musical goals"
      ],
      tip: "Your interpretation should be defensible - be able to explain why you make each musical choice."
    }
  }
};

// Function to get content for a lesson, with fallback
export function getLessonContent(lessonId: string): LessonContent | null {
  return lessonContents[lessonId] || null;
}

// Function to get notes for a lesson (used by Keyboard component)
export function getLessonNotes(lessonId: string): number[] {
  const content = lessonContents[lessonId];
  if (!content) return [];

  // If explicit highlightedNotes, use those
  if (content.highlightedNotes) return content.highlightedNotes;

  // If it's a scale lesson, generate from scale data
  if (content.scale) {
    return generateScaleNotes(content.scale.root, content.scale.pattern);
  }

  // If it's a chord lesson, generate from chord data
  if (content.chord) {
    return content.chord.intervals.map(i => content.chord!.root + i);
  }

  return [];
}
