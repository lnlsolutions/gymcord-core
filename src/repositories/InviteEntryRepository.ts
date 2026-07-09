import { invitationRepository, type InvitationMetadata, type InvitationType } from "../services/PublicBetaRepositories";

export type InviteEntryStatus = "valid" | "expired" | "rejected" | "accepted" | "archived" | "missing";

export interface PendingInviteEntry {
  code: string;
  status: InviteEntryStatus;
  invite: InvitationMetadata | null;
  preservedAt: string;
  source: "link" | "manual";
}

const pendingInviteKey = "gc.auth.pendingInvite";

function now() { return new Date().toISOString(); }

function statusFor(invite: InvitationMetadata | null): InviteEntryStatus {
  if (!invite) return "missing";
  if (new Date(invite.expiresAt).getTime() < Date.now()) return "expired";
  if (invite.status === "pending") return "valid";
  return invite.status;
}

export class InviteEntryRepository {
  validateBeforeAuth(code: string, type?: InvitationType): PendingInviteEntry {
    const invite = invitationRepository.validateCode(code, type);
    return { code: code.trim(), status: statusFor(invite), invite, preservedAt: now(), source: "link" };
  }

  preserve(entry: PendingInviteEntry): PendingInviteEntry {
    localStorage.setItem(pendingInviteKey, JSON.stringify(entry));
    return entry;
  }

  preserveCode(code: string, source: PendingInviteEntry["source"] = "manual"): PendingInviteEntry {
    const entry = { ...this.validateBeforeAuth(code), source };
    return this.preserve(entry);
  }

  getPending(): PendingInviteEntry | null {
    try { return JSON.parse(localStorage.getItem(pendingInviteKey) || "null") as PendingInviteEntry | null; }
    catch { return null; }
  }

  acceptAfterAuth(userId: string): PendingInviteEntry | null {
    const pending = this.getPending();
    if (!pending || pending.status !== "valid" || !pending.invite) return pending;
    const accepted: PendingInviteEntry = {
      ...pending,
      status: "accepted",
      invite: { ...pending.invite, status: "accepted", relationshipMetadata: { ...pending.invite.relationshipMetadata, acceptedByUserId: userId, acceptedAt: now(), metadataOnlyRelationship: "true" } },
    };
    localStorage.setItem(pendingInviteKey, JSON.stringify(accepted));
    return accepted;
  }

  clearPending(): void { localStorage.removeItem(pendingInviteKey); }

  getStorageKey(): string { return pendingInviteKey; }
}

export const inviteEntryRepository = new InviteEntryRepository();
