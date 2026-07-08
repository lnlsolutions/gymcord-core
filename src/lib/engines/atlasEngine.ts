import type { Achievement, AtlasInsight, Mission, StreakSnapshot, TransformationSnapshot, XpSnapshot } from "../../types/gymcord";

export function buildAtlasInsights(mission: Mission, xp: XpSnapshot, streak: StreakSnapshot, nextAchievement: Achievement, transformation?: TransformationSnapshot): AtlasInsight[] {
  const insights: AtlasInsight[] = [];
  const remainingXp = xp.xpNeededForNextLevel - xp.currentXp;
  const incompleteTasks = mission.tasks.filter((task) => !task.completed).sort((a, b) => a.completionPercentage - b.completionPercentage);

  if (transformation && transformation.momentum.momentum >= 70) {
    insights.push({ message: "You've gained momentum.", priority: "High" });
  }

  if (transformation && transformation.progress.recovery >= 78) {
    insights.push({ message: "You've recovered well.", priority: "Medium" });
  }

  if (transformation && transformation.progress.nutrition >= 68) {
    insights.push({ message: "Protein consistency is improving.", priority: "Medium" });
  }

  if (transformation && transformation.progress.recovery < 55) {
    insights.push({ message: "Sleep is limiting your progress.", priority: "High" });
  }

  if (remainingXp <= mission.xpReward) {
    insights.push({ message: `You are one mission away from Level ${xp.currentLevel + 1}.`, priority: "High" });
  }

  const water = mission.tasks.find((task) => task.id === "water");
  if (water && !water.completed) {
    insights.push({ message: `Drink ${Math.ceil(water.target - water.progress)} more glasses of water to complete today's mission.`, priority: "High" });
  }

  if (streak.streakInDanger) {
    insights.push({ message: "Your streak is in danger. Complete one mission action before the day resets.", priority: "High" });
  }

  if (incompleteTasks[0]) {
    insights.push({ message: `${incompleteTasks[0].title} is your biggest opportunity today.`, priority: "Medium" });
  }

  insights.push({ message: `${nextAchievement.title} is next: ${nextAchievement.completionPercentage}% complete.`, priority: "Low" });

  return insights.slice(0, 4);
}
