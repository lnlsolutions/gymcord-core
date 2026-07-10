export type Page =
  | "home"
  | "train"
  | "meals"
  | "progress"
  | "coach"
  | "settings";

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

export interface MissionTask {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  progress: number;
  target: number;
  completionPercentage: number;
}

export interface Mission {
  id: string;
  date: string;
  title: string;
  description: string;
  xpReward: number;
  earnedXp: number;
  completed: boolean;
  progress: number;
  target: number;
  completionPercentage: number;
  tasks: MissionTask[];
}

export interface XpSnapshot {
  totalXp: number;
  currentXp: number;
  currentLevel: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
}

export interface StreakDay {
  date: string;
  active: boolean;
  missed: boolean;
}

export interface StreakSnapshot {
  currentStreak: number;
  longestStreak: number;
  weeklyCalendar: StreakDay[];
  streakInDanger: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
  completionPercentage: number;
}

export interface AtlasInsight {
  message: string;
  priority: "High" | "Medium" | "Low";
}

export interface ProgressChartPoint {
  date: string;
  weight: number | null;
  mood: number;
  energy: number;
  recovery: number;
}

export interface ProgressSnapshot {
  startDate: string;
  currentDate: string;
  dayNumber: number;
  startWeight: number;
  currentWeight: number;
  estimatedBodyFat: number;
  strengthProgress: number;
  workoutCompletion: number;
  consistency: number;
  nutrition: number;
  recovery: number;
  missionCompletion: number;
  chartData: ProgressChartPoint[];
}

export interface PredictionInput {
  consistency: number;
  workoutCompletion: number;
  nutrition: number;
  recovery: number;
  streak: number;
  currentMomentum: number;
  loggedDays: number;
}

export interface PredictionSnapshot {
  momentum: number;
  projected30DayWeightChange: number;
  projected90DayWeightChange: number;
  projectedYearWeightChange: number;
  percentile: number;
  confidence: number;
  messages: string[];
}

export interface MomentumSnapshot {
  momentum: number;
  xpPercentage: number;
  level: number;
  streak: number;
  missionPercentage: number;
}

export interface TransformationMilestone {
  label: string;
  date: string;
  weight: number;
  bodyFat: number;
  strengthProgress: number;
  workoutCompletion: number;
  consistency: number;
  xpGrowth: number;
  missionCompletion: number;
  atlasConfidenceScore: number;
}

export interface TransformationSnapshot {
  progress: ProgressSnapshot;
  momentum: MomentumSnapshot;
  prediction: PredictionSnapshot;
  milestones: TransformationMilestone[];
}

export interface MemoryWorkoutEntry {
  date: string;
  completedExercises: string[];
  totalVolume: number;
  notes: string[];
}

export interface NutritionMemoryEntry {
  date: string;
  protein: number;
  calories: number;
  water: number;
}

export interface SleepMemoryEntry {
  date: string;
  sleep: number;
}

export interface RecoveryMemoryEntry {
  date: string;
  mood: number;
  energy: number;
  sleep: number;
}

export interface PrMemoryEntry {
  exercise: string;
  value: string;
  date: string;
}

export interface AtlasMemory {
  name: string;
  goal: string;
  injuries: string[];
  favoriteExercises: string[];
  workoutHistory: MemoryWorkoutEntry[];
  nutritionHistory: NutritionMemoryEntry[];
  sleepHistory: SleepMemoryEntry[];
  recoveryHistory: RecoveryMemoryEntry[];
  prHistory: PrMemoryEntry[];
  missionSnapshot?: Mission;
}

export interface AtlasContext {
  greeting: string;
  todayFocus: string;
  recoveryStatus: string;
  biggestOpportunity: string;
  lastWorkoutSummary: string;
  currentStreak: number;
  missionStatus: string;
  coachingMessages: string[];
}

export interface AtlasConversationEntry {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
  category: "training" | "nutrition" | "recovery" | "progress" | "general";
  metadata?: {
    coachMode: string;
    userGoal: string;
    tenantContext: unknown;
    trainerContext: unknown;
    onboardingContext: unknown;
    memory: unknown;
    pendingProviderRequests: unknown[];
    failedProviderRequests: unknown[];
    safety: unknown;
  };
}
