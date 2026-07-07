import type { Reward } from "../../types/gymcord";

export function RewardCard({ reward }: { reward: Reward }) {
  return (
    <div className={reward.unlocked ? "reward-card unlocked" : "reward-card"}>
      <div>
        <p>{reward.unlocked ? "Unlocked" : "Locked"}</p>
        <h3>{reward.title}</h3>
        <span>{reward.description}</span>
      </div>

      <strong>{reward.score}%</strong>
    </div>
  );
}
