import { useAuth } from "../../auth";
import { appConfig } from "../../config";
import { createEmptyProfile, saved } from "../../lib/storage";
import { atlasRepository } from "../../repositories/AtlasRepository";
import { atlasConversationRepository } from "../../repositories/AtlasConversationRepository";
import { atlasPlanRepository } from "../../repositories/AtlasPlanRepository";
import { AtlasHome } from "../atlas/AtlasHome";

export function DeveloperAtlas() {
  const auth = useAuth();
  const profile = saved(appConfig.storageKeys.profile, createEmptyProfile());
  const state = atlasRepository.getFoundationState(auth.session, profile);
  const history = atlasConversationRepository.loadHistory();
  const generatedPlans = atlasPlanRepository.generateAllMockPlans(state.coachMode);
  return <><AtlasHome developer /><main className="page"><section className="panel"><h3>Developer Atlas diagnostics</h3><div className="atlas-status-grid"><div><span>Tenant context</span><strong>{state.tenantContext.tenantName}</strong></div><div><span>Trainer context</span><strong>{state.trainerContext.reviewState}</strong></div><div><span>Onboarding context</span><strong>{state.onboardingContext.goal ?? "No goal"}</strong></div><div><span>Pending provider requests</span><strong>{state.pendingProviderRequests.length}</strong></div><div><span>Failed provider requests</span><strong>{state.failedProviderRequests.length}</strong></div><div><span>Safety confidence</span><strong>{state.safetyMetadata.confidenceLevel}</strong></div></div></section><section className="panel"><h3>Conversation history</h3>{history.map((entry) => <div className="coach-card" key={entry.id}><strong>{entry.category}</strong><p>{entry.question}</p><p>{entry.answer}</p></div>)}</section><section className="panel"><h3>Generated plans</h3>{generatedPlans.map((plan) => <div className="coach-card" key={plan.id}><strong>{plan.type}</strong><p>{plan.summary}</p></div>)}</section><section className="panel"><h3>Raw metadata</h3><pre>{JSON.stringify(state, null, 2)}</pre></section></main></>;
}
