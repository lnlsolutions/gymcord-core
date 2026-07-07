export type Page =
  | "home"
  | "train"
  | "meals"
  | "progress"
  | "coach";

export interface Exercise {
  id: string;
  name: string;
  prescription: string;
  description: string;
  cues: string[];
  muscles: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  equipment: string;
  image: string;
}

export interface WorkoutDay {
  id: string;
  day: string;
  title: string;
  focus: string;
  duration: number;
  image: string;
  exercises: Exercise[];
}

export interface Measurements {
  weight: string;
  waist: string;
  hips: string;
  glutes: string;
  thighs: string;
  arms: string;
  chest: string;
}

export interface ProgressPhotos {
  front: string;
  side: string;
  back: string;
}

export interface DailyLog {
  date: string;
  completedExercises: Record<string, boolean>;
  weights: Record<string, string>;
  notes: Record<string, string>;
  protein: number;
  calories: number;
  water: number;
  sleep: number;
  steps: number;
  mood: number;
  energy: number;
  ingredients: string;
  mealPhoto: string;
  measurements: Measurements;
  photos: ProgressPhotos;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: string;
  height: string;
  currentWeight: string;
  goalWeight: string;
  activityLevel: string;
  goal: string;
  startDate: string;
  profilePhoto: string;
}

export interface Reward {
  title: string;
  description: string;
  score: number;
  unlocked: boolean;
}

export interface CoachInsight {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}
