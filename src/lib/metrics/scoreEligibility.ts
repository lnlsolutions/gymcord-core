import { hasMinimumActivityData, hasMinimumBodyData, hasMinimumNutritionData, hasMinimumProgressData, hasMinimumRecoveryData, hasMinimumSleepData, hasMinimumWorkoutData, type MemberMetricData } from "./dataSufficiency";

export const NO_DATA_LABEL = "No data yet";
export const UNLOCK_INSIGHT_LABEL = "Start logging to unlock this insight";
export const NOT_ENOUGH_DATA_LABEL = "Not enough data to calculate";
export const ADD_FIRST_ENTRY_LABEL = "Add your first entry";

export function canCalculateFitnessScore(data: MemberMetricData) { return hasMinimumWorkoutData(data) && hasMinimumActivityData(data); }
export function canCalculateNutritionScore(data: MemberMetricData) { return hasMinimumNutritionData(data); }
export function canCalculateSleepScore(data: MemberMetricData) { return hasMinimumSleepData(data); }
export function canCalculateRecoveryScore(data: MemberMetricData) { return hasMinimumRecoveryData(data); }
export function canCalculateReadinessScore(data: MemberMetricData) { return hasMinimumSleepData(data) && hasMinimumRecoveryData(data); }
export function canCalculateProgressScore(data: MemberMetricData) { return hasMinimumProgressData(data) && hasMinimumBodyData(data); }
