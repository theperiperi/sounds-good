export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: "theory" | "practical" | "exercise";
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Grade {
  id: number;
  title: string;
  description: string;
  modules: Module[];
  color: string;
}

export const grades: Grade[] = [
  {
    id: 1,
    title: "Grade 1 - Beginner",
    description: "First steps into music. Learn basic notation, posture, and simple melodies.",
    color: "from-green-500 to-emerald-600",
    modules: [
      {
        id: "g1-basics",
        title: "Getting Started",
        description: "Keyboard basics and first notes",
        lessons: [
          { id: "g1-intro", title: "Welcome to Piano", description: "Introduction to the keyboard and course overview", duration: "5 min", type: "theory" },
          { id: "g1-posture", title: "Hand Position & Posture", description: "Proper sitting, arm position, and curved fingers", duration: "10 min", type: "practical" },
          { id: "g1-keyboard-layout", title: "The Keyboard Layout", description: "Understanding white and black keys, octaves", duration: "8 min", type: "theory" },
          { id: "g1-middle-c", title: "Finding Middle C", description: "Locate middle C and nearby notes", duration: "5 min", type: "exercise" },
        ]
      },
      {
        id: "g1-notes",
        title: "Note Names",
        description: "Learn the musical alphabet",
        lessons: [
          { id: "g1-cde", title: "C, D, E", description: "First three notes with right hand", duration: "10 min", type: "practical" },
          { id: "g1-fgab", title: "F, G, A, B", description: "Complete the musical alphabet", duration: "10 min", type: "practical" },
          { id: "g1-note-quiz", title: "Note Recognition", description: "Interactive note identification", duration: "5 min", type: "exercise" },
        ]
      },
      {
        id: "g1-rhythm",
        title: "Basic Rhythm",
        description: "Understanding note values",
        lessons: [
          { id: "g1-pulse", title: "Feeling the Pulse", description: "Steady beat and counting", duration: "8 min", type: "theory" },
          { id: "g1-note-values", title: "Note Values", description: "Whole, half, and quarter notes", duration: "10 min", type: "theory" },
          { id: "g1-rhythm-exercise", title: "Clapping Rhythms", description: "Practice reading rhythms", duration: "8 min", type: "exercise" },
        ]
      },
      {
        id: "g1-scales",
        title: "First Scales",
        description: "C Major scale introduction",
        lessons: [
          { id: "g1-c-major-rh", title: "C Major - Right Hand", description: "Five-finger C major pattern", duration: "15 min", type: "practical" },
          { id: "g1-c-major-lh", title: "C Major - Left Hand", description: "Left hand C position", duration: "15 min", type: "practical" },
          { id: "g1-scale-practice", title: "Scale Practice", description: "Hands separate scale work", duration: "10 min", type: "exercise" },
        ]
      },
    ]
  },
  {
    id: 2,
    title: "Grade 2 - Elementary",
    description: "Expand your range with new keys and simple pieces.",
    color: "from-blue-500 to-indigo-600",
    modules: [
      {
        id: "g2-new-keys",
        title: "New Key Signatures",
        description: "G Major and F Major",
        lessons: [
          { id: "g2-g-major", title: "G Major Scale", description: "Introducing F sharp", duration: "15 min", type: "practical" },
          { id: "g2-f-major", title: "F Major Scale", description: "Introducing B flat", duration: "15 min", type: "practical" },
          { id: "g2-key-signatures", title: "Understanding Key Signatures", description: "Sharps and flats in key signatures", duration: "10 min", type: "theory" },
        ]
      },
      {
        id: "g2-intervals",
        title: "Intervals",
        description: "The distance between notes",
        lessons: [
          { id: "g2-2nds-3rds", title: "Seconds and Thirds", description: "Steps and skips", duration: "12 min", type: "theory" },
          { id: "g2-4ths-5ths", title: "Fourths and Fifths", description: "Larger intervals", duration: "12 min", type: "theory" },
          { id: "g2-interval-ear", title: "Interval Ear Training", description: "Recognizing intervals by ear", duration: "10 min", type: "exercise" },
        ]
      },
      {
        id: "g2-chords",
        title: "Introduction to Chords",
        description: "Playing multiple notes together",
        lessons: [
          { id: "g2-triads", title: "Triads", description: "Root, third, fifth", duration: "15 min", type: "theory" },
          { id: "g2-c-chord", title: "C Major Chord", description: "Your first chord", duration: "10 min", type: "practical" },
          { id: "g2-g-f-chords", title: "G and F Chords", description: "Primary chords in C major", duration: "15 min", type: "practical" },
        ]
      },
    ]
  },
  {
    id: 3,
    title: "Grade 3 - Lower Intermediate",
    description: "Hands together playing and minor keys.",
    color: "from-purple-500 to-violet-600",
    modules: [
      {
        id: "g3-minor",
        title: "Minor Keys",
        description: "Understanding the minor sound",
        lessons: [
          { id: "g3-minor-intro", title: "Major vs Minor", description: "Hearing the difference", duration: "10 min", type: "theory" },
          { id: "g3-a-minor", title: "A Minor Scale", description: "Relative minor of C major", duration: "15 min", type: "practical" },
          { id: "g3-d-minor", title: "D Minor Scale", description: "Another natural minor", duration: "15 min", type: "practical" },
        ]
      },
      {
        id: "g3-coordination",
        title: "Hands Together",
        description: "Developing hand independence",
        lessons: [
          { id: "g3-parallel", title: "Parallel Motion", description: "Both hands moving together", duration: "15 min", type: "practical" },
          { id: "g3-contrary", title: "Contrary Motion", description: "Hands moving apart", duration: "15 min", type: "practical" },
          { id: "g3-independence", title: "Hand Independence", description: "Different patterns in each hand", duration: "20 min", type: "exercise" },
        ]
      },
    ]
  },
  {
    id: 4,
    title: "Grade 4 - Intermediate",
    description: "Arpeggios, more complex rhythms, and expressive playing.",
    color: "from-orange-500 to-amber-600",
    modules: [
      {
        id: "g4-arpeggios",
        title: "Arpeggios",
        description: "Broken chord patterns",
        lessons: [
          { id: "g4-arp-intro", title: "What are Arpeggios?", description: "Playing chords as broken patterns", duration: "10 min", type: "theory" },
          { id: "g4-c-arpeggio", title: "C Major Arpeggio", description: "Two octave arpeggios", duration: "15 min", type: "practical" },
          { id: "g4-g-f-arp", title: "G and F Arpeggios", description: "Expanding arpeggio skills", duration: "15 min", type: "practical" },
        ]
      },
    ]
  },
  {
    id: 5,
    title: "Grade 5 - Upper Intermediate",
    description: "Music theory exam level. All major scales, chromatic scale, and sight-reading.",
    color: "from-red-500 to-rose-600",
    modules: [
      {
        id: "g5-all-majors",
        title: "All Major Scales",
        description: "Complete major scale mastery",
        lessons: [
          { id: "g5-sharp-keys", title: "Sharp Key Scales", description: "G, D, A, E, B major", duration: "20 min", type: "practical" },
          { id: "g5-flat-keys", title: "Flat Key Scales", description: "F, Bb, Eb, Ab, Db major", duration: "20 min", type: "practical" },
          { id: "g5-chromatic", title: "Chromatic Scale", description: "All 12 semitones", duration: "15 min", type: "practical" },
        ]
      },
      {
        id: "g5-theory",
        title: "Grade 5 Theory",
        description: "Preparing for theory exams",
        lessons: [
          { id: "g5-time-signatures", title: "Time Signatures", description: "Simple and compound time", duration: "15 min", type: "theory" },
          { id: "g5-transposition", title: "Transposition", description: "Moving music to different keys", duration: "15 min", type: "theory" },
          { id: "g5-terms", title: "Musical Terms", description: "Italian terms and dynamics", duration: "10 min", type: "theory" },
        ]
      },
    ]
  },
  {
    id: 6,
    title: "Grade 6 - Advanced",
    description: "Advanced repertoire and technique.",
    color: "from-teal-500 to-cyan-600",
    modules: [
      {
        id: "g6-technique",
        title: "Advanced Technique",
        description: "Building virtuosity",
        lessons: [
          { id: "g6-octaves", title: "Octave Playing", description: "Relaxed octave technique", duration: "15 min", type: "practical" },
          { id: "g6-double-thirds", title: "Double Thirds", description: "Playing in thirds", duration: "20 min", type: "practical" },
        ]
      },
    ]
  },
  {
    id: 7,
    title: "Grade 7 - Diploma Prep",
    description: "Pre-diploma level studies.",
    color: "from-pink-500 to-fuchsia-600",
    modules: [
      {
        id: "g7-repertoire",
        title: "Concert Repertoire",
        description: "Building a recital program",
        lessons: [
          { id: "g7-baroque", title: "Baroque Style", description: "Bach and Handel", duration: "20 min", type: "theory" },
          { id: "g7-classical", title: "Classical Style", description: "Mozart and Haydn", duration: "20 min", type: "theory" },
        ]
      },
    ]
  },
  {
    id: 8,
    title: "Grade 8 - Diploma",
    description: "Professional-level musicianship.",
    color: "from-slate-600 to-slate-800",
    modules: [
      {
        id: "g8-mastery",
        title: "Complete Mastery",
        description: "Final level achievement",
        lessons: [
          { id: "g8-all-scales", title: "All Scales & Arpeggios", description: "Complete technical mastery", duration: "30 min", type: "practical" },
          { id: "g8-interpretation", title: "Musical Interpretation", description: "Finding your voice", duration: "20 min", type: "theory" },
        ]
      },
    ]
  },
];

export const musicTheoryTopics = [
  {
    id: "circle-of-fifths",
    title: "Circle of Fifths",
    description: "The master key to understanding key relationships",
    icon: "🎯",
  },
  {
    id: "chord-progressions",
    title: "Chord Progressions",
    description: "How chords move and connect",
    icon: "🔗",
  },
  {
    id: "scales-modes",
    title: "Scales & Modes",
    description: "Major, minor, and modal scales",
    icon: "🎼",
  },
  {
    id: "rhythm-time",
    title: "Rhythm & Time",
    description: "Time signatures, tempo, and rhythm",
    icon: "⏱️",
  },
  {
    id: "intervals",
    title: "Intervals",
    description: "The building blocks of melody and harmony",
    icon: "📏",
  },
  {
    id: "harmony",
    title: "Harmony",
    description: "How notes work together",
    icon: "🎵",
  },
];
