export interface Exercise {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  defaultRounds: number;
  pattern: {
    inhale: number;
    hold?: number;
    exhale: number;
    holdEmpty?: number;
  };
  moods: string[];
}

export const exercises: Exercise[] = [
  {
    id: "box-breathing",
    name: "Box Breathing",
    description: "A simple yet powerful technique used by Navy SEALs for focus and stress relief",
    benefits: [
      "Reduces stress and anxiety",
      "Improves concentration",
      "Helps manage emotions",
      "Increases mental clarity"
    ],
    defaultRounds: 4,
    pattern: {
      inhale: 4,
      hold: 4,
      exhale: 4,
      holdEmpty: 4
    },
    moods: ["stressed", "anxious", "unfocused"]
  },
  {
    id: "4-7-8",
    name: "4-7-8 Breathing",
    description: "A natural tranquilizer for the nervous system",
    benefits: [
      "Promotes better sleep",
      "Reduces anxiety",
      "Helps control anger responses",
      "Improves digestion"
    ],
    defaultRounds: 4,
    pattern: {
      inhale: 4,
      hold: 7,
      exhale: 8
    },
    moods: ["anxious", "angry", "insomnia"]
  },
  {
    id: "wim-hof",
    name: "Wim Hof Method",
    description: "Powerful breathing technique for energy and immune system boost",
    benefits: [
      "Boosts energy levels",
      "Strengthens immune system",
      "Improves cold tolerance",
      "Enhances mental focus"
    ],
    defaultRounds: 3,
    pattern: {
      inhale: 2,
      exhale: 2,
      holdEmpty: 15
    },
    moods: ["tired", "low-energy", "unfocused"]
  }
];

export const moods = [
  { id: "stressed", label: "Stressed", icon: "Brain" },
  { id: "anxious", label: "Anxious", icon: "Heart" },
  { id: "tired", label: "Tired", icon: "Moon" },
  { id: "angry", label: "Angry", icon: "Flame" },
  { id: "unfocused", label: "Unfocused", icon: "Target" }
];

export function getExercisesByMood(mood: string): Exercise[] {
  return exercises.filter(exercise => exercise.moods.includes(mood));
}
