import type { DailyLog, Profile } from "../../types/gymcord";
import { calculateTransformationScore, getCoachInsights, getRewards, calculateWorkoutCompletion } from "../../lib/scoring";
import { workouts } from "../../lib/program";
import { RewardCard } from "./RewardCard";
import { AtlasConversation } from "./AtlasConversation";

export function Coach({ profile, dayLog }: { profile: Profile; dayLog: DailyLog }) {
  const totalExercises = workouts.reduce((sum, day) => sum + day.exercises.length, 0);
  const completion = calculateWorkoutCompletion(dayLog, totalExercises);
  const score = calculateTransformationScore(dayLog, completion);
  const insights = getCoachInsights(dayLog, completion, score);
  const rewards = getRewards(score);

  return (
    <>
      <AtlasConversation profile={profile} dayLog={dayLog} />
      <section className="page">
        <div className="panel reward-ready center"><div className="big-emoji">🤖</div><h2>{score}%</h2><p>Transformation Score</p></div>
        <div className="panel"><h3>Coach Insights</h3>{insights.map((item) => <div key={item.title} className="coach-card"><strong>{item.title}</strong><p>{item.description}</p><span>{item.priority} Priority</span></div>)}</div>
        <div className="panel"><h3>Reward Progress</h3>{rewards.map((reward) => <RewardCard key={reward.title} reward={reward} />)}</div>
      </section>
    </>
  );
}
