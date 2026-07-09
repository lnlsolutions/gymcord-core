import type { MemberCheckIn } from "../../repositories/CheckInRepository";
import { Panel } from "./shared";
export function FollowUpTasks({ checkIn }: { checkIn: MemberCheckIn }) { return <Panel title="Follow-up Tasks"><ul>{checkIn.followUpTasks.map((t) => <li key={t.id}>{t.title} · {t.ownerRole} · {t.status} · {t.integrationTargets.join(", ")}</li>)}</ul></Panel>; }
