import { z } from "zod";

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
  },
  {
    id: "nadi-shodhana",
    name: "Alternate Nostril Breathing",
    description: "Ancient yogic breathing technique for balance and harmony",
    benefits: [
      "Balances left and right brain",
      "Reduces stress and anxiety",
      "Improves cardiovascular function",
      "Enhances overall well-being"
    ],
    defaultRounds: 10,
    pattern: {
      inhale: 4,
      hold: 4,
      exhale: 4,
      holdEmpty: 4
    },
    moods: ["anxious", "unfocused", "stressed"]
  },
  {
    id: "coherent-breathing",
    name: "Resonant Breathing",
    description: "Optimal breathing pattern for heart rate variability and stress reduction",
    benefits: [
      "Improves heart rate variability",
      "Reduces stress and anxiety",
      "Enhances emotional regulation",
      "Boosts immune function"
    ],
    defaultRounds: 5,
    pattern: {
      inhale: 5.5,
      exhale: 5.5
    },
    moods: ["stressed", "anxious", "overwhelmed"]
  },
  {
    id: "diaphragmatic",
    name: "Diaphragmatic Breathing",
    description: "Deep belly breathing for relaxation and stress relief",
    benefits: [
      "Reduces stress",
      "Lowers blood pressure",
      "Improves core stability",
      "Enhances relaxation"
    ],
    defaultRounds: 6,
    pattern: {
      inhale: 4,
      hold: 2,
      exhale: 6
    },
    moods: ["stressed", "anxious", "tense"]
  },
  {
    id: "kapalbhati",
    name: "Stimulating Breath",
    description: "Energizing breathing technique for focus and vitality",
    benefits: [
      "Increases energy",
      "Improves concentration",
      "Clears mind",
      "Boosts metabolism"
    ],
    defaultRounds: 20,
    pattern: {
      inhale: 1,
      exhale: 1
    },
    moods: ["tired", "sluggish", "unfocused"]
  },
  {
    id: "2-to-1",
    name: "2:1 Breathing",
    description: "Calming breath pattern for relaxation and sleep",
    benefits: [
      "Improves sleep quality",
      "Reduces anxiety",
      "Calms nervous system",
      "Promotes relaxation"
    ],
    defaultRounds: 8,
    pattern: {
      inhale: 4,
      exhale: 8
    },
    moods: ["insomnia", "anxious", "restless"]
  },
  {
    id: "lions-breath",
    name: "Lion's Breath",
    description: "Energetic release for stress and tension",
    benefits: [
      "Releases facial tension",
      "Reduces stress",
      "Improves voice projection",
      "Boosts confidence"
    ],
    defaultRounds: 6,
    pattern: {
      inhale: 4,
      hold: 2,
      exhale: 4
    },
    moods: ["stressed", "tense", "anxious"]
  },
  {
    id: "sama-vritti",
    name: "Equal Breathing",
    description: "Balanced breathing for focus and meditation",
    benefits: [
      "Improves focus",
      "Reduces stress",
      "Balances energy",
      "Enhances meditation"
    ],
    defaultRounds: 10,
    pattern: {
      inhale: 4,
      exhale: 4
    },
    moods: ["unfocused", "stressed", "overwhelmed"]
  },
  {
    id: "pursed-lip",
    name: "Pursed Lip Breathing",
    description: "Controlled breathing technique for respiratory health",
    benefits: [
      "Improves breathing efficiency",
      "Reduces shortness of breath",
      "Releases trapped air",
      "Slows breathing rate"
    ],
    defaultRounds: 5,
    pattern: {
      inhale: 2,
      exhale: 4
    },
    moods: ["anxious", "short-of-breath", "stressed"]
  },
  {
    id: "square",
    name: "Square Breathing",
    description: "Four-part breath for performance and focus",
    benefits: [
      "Enhances performance",
      "Improves focus",
      "Reduces stress",
      "Increases mental clarity"
    ],
    defaultRounds: 5,
    pattern: {
      inhale: 4,
      hold: 4,
      exhale: 4,
      holdEmpty: 4
    },
    moods: ["unfocused", "stressed", "preparing"]
  },
  {
    id: "bhramari",
    name: "Humming Bee Breath",
    description: "Calming humming breath for anxiety and sleep",
    benefits: [
      "Reduces anxiety",
      "Improves sleep",
      "Calms mind",
      "Relieves tension"
    ],
    defaultRounds: 6,
    pattern: {
      inhale: 4,
      hold: 4,
      exhale: 6
    },
    moods: ["anxious", "insomnia", "stressed"]
  },
  {
    id: "ujjayi",
    name: "Ocean Breath",
    description: "Warming breath for focus and meditation",
    benefits: [
      "Increases focus",
      "Builds internal heat",
      "Reduces anxiety",
      "Enhances meditation"
    ],
    defaultRounds: 8,
    pattern: {
      inhale: 4,
      exhale: 4
    },
    moods: ["unfocused", "anxious", "preparing"]
  },
  {
    id: "buteyko",
    name: "Buteyko Method",
    description: "Reduced breathing technique for respiratory health",
    benefits: [
      "Improves asthma symptoms",
      "Reduces breathing rate",
      "Increases CO2 tolerance",
      "Enhances oxygen delivery"
    ],
    defaultRounds: 6,
    pattern: {
      inhale: 2,
      exhale: 5,
      holdEmpty: 3
    },
    moods: ["short-of-breath", "anxious", "stressed"]
  }
];

export const moods = [
  { id: "stressed", label: "Stressed", icon: "Brain" },
  { id: "anxious", label: "Anxious", icon: "Heart" },
  { id: "tired", label: "Tired", icon: "Moon" },
  { id: "angry", label: "Angry", icon: "Flame" },
  { id: "unfocused", label: "Unfocused", icon: "Target" },
  { id: "insomnia", label: "Can't Sleep", icon: "BedDouble" },
  { id: "tense", label: "Tense", icon: "Squirrel" },
  { id: "overwhelmed", label: "Overwhelmed", icon: "Waves" },
  { id: "preparing", label: "Preparing", icon: "Rocket" },
  { id: "short-of-breath", label: "Short of Breath", icon: "Wind" },
  { id: "restless", label: "Restless", icon: "Shuffle" },
  { id: "sluggish", label: "Sluggish", icon: "Battery" }
];

export function getExercisesByMood(mood: string): Exercise[] {
  return exercises.filter(exercise => exercise.moods.includes(mood));
}