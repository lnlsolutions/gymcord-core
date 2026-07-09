import type { AuthSession } from "../../auth/types";
import { sessionRoutingRepository } from "../../repositories/SessionRoutingRepository";
export function SessionRoutingPanel({ session }: { session: AuthSession | null }) { const decision = sessionRoutingRepository.decide(session); return <section className="panel"><h2>Session routing decision</h2><pre>{JSON.stringify(decision, null, 2)}</pre></section>; }
