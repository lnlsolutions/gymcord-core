export type Page = "home" | "train" | "meals" | "progress" | "coach";

export type Exercise = {
  name: string;
  prescription: string;
  description: string;
  cues: string[];
};

export type WorkoutDay = {
  day: string;
  title: string;
  image: string;
  focus: string;
  exercises: Exercise[];
};

export type DailyLog = {
  checks: Record<string, boolean>;
  weights: Record<string, string>;
  notes: Record<string, string>;
  mealPhoto: string;
  ingredients: string;
  calories: string;
  protein: number;
  water: number;
  measurements: {
    waist: string;
    hips: string;
    glutes: string;
    weight: string;
  };
  photos: {
    front: string;
    side: string;
    back: string;
  };
};

export type Profile = {
  name: string;
  goal: string;
  startDate: string;
};
