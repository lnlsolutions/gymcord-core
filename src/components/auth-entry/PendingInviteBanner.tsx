import { inviteEntryRepository } from "../../repositories/InviteEntryRepository";

export function PendingInviteBanner() {
  const pending = inviteEntryRepository.getPending();
  if (!pending) return null;
  return <section className="panel"><p className="pill">Pending invite: {pending.status}</p><h2>{pending.invite?.tenantName ?? "Unknown invitation"}</h2><p>Code {pending.code} is preserved through signup/login. Relationships are metadata-only; your account owns personal data forever.</p></section>;
}
