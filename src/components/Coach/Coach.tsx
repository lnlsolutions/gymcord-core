import type { Achievement, AtlasInsight, DailyLog, Mission, Profile, StreakSnapshot, XpSnapshot } from "../../types/gymcord";
import { calculateTransformationScore, getCoachInsights, getRewards, calculateWorkoutCompletion } from "../../lib/scoring";
import { workouts } from "../../lib/program";
import { RewardCard } from "./RewardCard";
import { AtlasConversation } from "./AtlasConversation";

export function Coach({ profile, dayLog, mission, xp, streak, nextAchievement, atlasInsights }: { profile: Profile; dayLog: DailyLog; mission: Mission; xp: XpSnapshot; streak: StreakSnapshot; nextAchievement: Achievement; atlasInsights: AtlasInsight[] }) {
  const totalExercises = workouts.reduce((sum, day) => sum + day.exercises.length, 0);
  const completion = calculateWorkoutCompletion(dayLog, totalExercises);
  const score = calculateTransformationScore(dayLog, completion);
  const insights = getCoachInsights(dayLog, completion, score);
  const rewards = getRewards(score);

  return (
    <>
      <AtlasConversation profile={profile} dayLog={dayLog} />
      <section className="page">
        <div className="panel reward-ready center"><div className="big-emoji">🤖</div><h2>Level {xp.currentLevel}</h2><p>{mission.completionPercentage}% Mission · {streak.currentStreak} day streak</p></div>
        <div className="panel"><h3>Atlas Coaching</h3>{atlasInsights.map((item) => <div key={item.message} className="coach-card"><strong>{item.priority} Priority</strong><p>{item.message}</p></div>)}</div>
        <div className="panel"><h3>Next Achievement</h3><div className="coach-card"><strong>{nextAchievement.title}</strong><p>{nextAchievement.description}</p><span>{nextAchievement.progress}/{nextAchievement.target} complete</span></div></div>
        <div className="panel"><h3>Coach Insights</h3>{insights.map((item) => <div key={item.title} className="coach-card"><strong>{item.title}</strong><p>{item.description}</p><span>{item.priority} Priority</span></div>)}</div>
        <div className="panel"><h3>Reward Progress</h3>{rewards.map((reward) => <RewardCard key={reward.title} reward={reward} />)}</div>
      </section>
    </>
  );
}
