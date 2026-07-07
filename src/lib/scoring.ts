import type { CoachInsight, DailyLog, Reward } from "../types/gymcord";

export function calculateWorkoutCompletion(dayLog: DailyLog, totalExercises: number) {
  if (!totalExercises) return 0;

  const completed = Object.values(dayLog.completedExercises || {}).filter(Boolean).length;

  return Math.round((completed / totalExercises) * 100);
}

export function calculateTransformationScore(dayLog: DailyLog, workoutCompletion: number) {
  let score = 0;

  score += Math.min(35, workoutCompletion * 0.35);
  score += Math.min(20, dayLog.protein / 6.5);
  score += Math.min(12, dayLog.water * 1.5);
  score += Math.min(8, dayLog.sleep);
  score += dayLog.mealPhoto ? 5 : 0;
  score += dayLog.photos.front ? 6 : 0;
  score += dayLog.photos.side ? 4 : 0;
  score += dayLog.photos.back ? 5 : 0;
  score += dayLog.measurements.weight || dayLog.measurements.glutes ? 5 : 0;

  return Math.min(100, Math.round(score));
}

export function getCoachInsights(
  dayLog: DailyLog,
  workoutCompletion: number,
  score: number
): CoachInsight[] {
  const insights: CoachInsight[] = [];

  if (workoutCompletion < 60) {
    insights.push({
      title: "Workout consistency",
      description: "Complete today’s workout to increase your transformation score and keep your week on track.",
      priority: "High",
    });
  }

  if (dayLog.protein < 100) {
    insights.push({
      title: "Protein target",
      description: "Your protein is low today. Aim for 100–130g to support muscle growth and recovery.",
      priority: "High",
    });
  }

  if (dayLog.water < 6) {
    insights.push({
      title: "Hydration",
      description: "Increase water intake to at least 6–8 glasses today.",
      priority: "Medium",
    });
  }

  if (!dayLog.mealPhoto) {
    insights.push({
      title: "Meal verification",
      description: "Upload a meal photo so your nutrition history is easier to review later.",
      priority: "Medium",
    });
  }

  if (!dayLog.photos.front && !dayLog.photos.side && !dayLog.photos.back) {
    insights.push({
      title: "Progress photos",
      description: "Add front, side, and back photos to start building visual progress history.",
      priority: "Medium",
    });
  }

  if (score >= 85) {
    insights.push({
      title: "Reward eligible",
      description: "Your score is high enough for reward eligibility review.",
      priority: "Low",
    });
  }

  if (insights.length === 0) {
    insights.push({
      title: "Strong day",
      description: "You are tracking well today. Keep your workouts, meals, water, and photos consistent.",
      priority: "Low",
    });
  }

  return insights;
}

export function getRewards(score: number): Reward[] {
  return [
    {
      title: "Consistency Reward",
      description: "Eligible after reaching an 85% transformation score.",
      score: 85,
      unlocked: score >= 85,
    },
    {
      title: "Elite Progress Reward",
      description: "Eligible after reaching a 95% transformation score.",
      score: 95,
      unlocked: score >= 95,
    },
  ];
}
