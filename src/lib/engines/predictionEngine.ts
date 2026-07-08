import type { PredictionInput, PredictionSnapshot } from "../../types/gymcord";
import { clampPercentage } from "./constants";

export interface PredictionStrategy {
  predict(input: PredictionInput): PredictionSnapshot;
}

export class RuleBasedPredictionStrategy implements PredictionStrategy {
  predict(input: PredictionInput): PredictionSnapshot {
    const momentum = clampPercentage(input.consistency * 0.28 + input.workoutCompletion * 0.22 + input.nutrition * 0.18 + input.recovery * 0.16 + Math.min(100, input.streak * 7) * 0.16);
    const weeklyLossRate = 0.35 + (momentum / 100) * 0.65;
    const projected90DayWeightChange = Number(((weeklyLossRate * 90) / 7).toFixed(1));
    const percentile = clampPercentage(Math.round(48 + momentum * 0.46));

    return {
      momentum,
      projected30DayWeightChange: Number(((weeklyLossRate * 30) / 7).toFixed(1)),
      projected90DayWeightChange,
      projectedYearWeightChange: Number(((weeklyLossRate * 365) / 7).toFixed(1)),
      percentile,
      confidence: clampPercentage(58 + input.loggedDays * 2.4 + momentum * 0.22),
      messages: [
        `Maintain this pace and Atlas predicts ${projected90DayWeightChange} lbs lost in 90 days.`,
        `This consistency places you ahead of ${percentile}% of members.`,
      ],
    };
  }
}

export function buildPrediction(input: PredictionInput, strategy: PredictionStrategy = new RuleBasedPredictionStrategy()) {
  return strategy.predict(input);
}
