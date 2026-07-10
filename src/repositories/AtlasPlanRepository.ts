import { atlasRepository, type AtlasCoachMode, type AtlasGeneratedPlan, type AtlasPlanType } from "./AtlasRepository";

const copy: Record<AtlasPlanType, { title: string; summary: string; recommendations: string[] }> = {
  workout: { title: "Mock Workout Plan", summary: "A goal-based weekly training foundation with progressive effort and recovery checks.", recommendations: ["Train 3-4 days this week with one primary strength focus each day.", "Keep 1-2 reps in reserve and stop for sharp pain.", "Log weights, notes, mood, and energy after each session."] },
  nutrition: { title: "Mock Nutrition Plan", summary: "A practical nutrition foundation focused on protein, hydration, and consistency.", recommendations: ["Build each meal around a protein source and colorful plants.", "Log calories only as a planning signal, not a diagnosis.", "Review dietary restrictions with a qualified professional when needed."] },
  "weekly-check-in": { title: "Mock Weekly Check-In Summary", summary: "A trainer-review-ready recap of adherence, recovery, and next actions.", recommendations: ["Celebrate completed sessions and logged meals.", "Flag sleep, mood, or pain concerns for human review.", "Choose one habit to improve next week."] },
  "progress-insight": { title: "Mock Progress Insight", summary: "A trend-oriented insight using logged workouts, nutrition, recovery, and measurements.", recommendations: ["Compare weekly averages instead of single-day swings.", "Watch consistency, recovery, and energy together.", "Request trainer review before major program changes."] },
  "habit-recommendation": { title: "Mock Habit Recommendation", summary: "A small behavior target designed for sustainable adherence.", recommendations: ["Set a two-minute minimum action for hard days.", "Attach the habit to an existing routine.", "Track completion without judging missed days."] },
  "recovery-recommendation": { title: "Mock Recovery Recommendation", summary: "A recovery-first coaching prompt that avoids medical diagnosis.", recommendations: ["Prioritize sleep and hydration before increasing intensity.", "Use lower-intensity movement when energy is low.", "Escalate pain, dizziness, or concerning symptoms to a clinician."] },
};

export class AtlasPlanRepository {
  generateMockPlan(type: AtlasPlanType, mode: AtlasCoachMode = atlasRepository.getCoachMode()): AtlasGeneratedPlan {
    const item = copy[type];
    atlasRepository.createPendingProviderRequest(type);
    return { id: crypto.randomUUID(), type, title: item.title, summary: item.summary, recommendations: item.recommendations, createdAt: new Date().toISOString(), mode, safety: atlasRepository.getSafetyMetadata(mode) };
  }
  generateAllMockPlans(mode: AtlasCoachMode = atlasRepository.getCoachMode()) { return (Object.keys(copy) as AtlasPlanType[]).map((type) => this.generateMockPlan(type, mode)); }
}
export const atlasPlanRepository = new AtlasPlanRepository();
