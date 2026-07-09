import { offlineEngine, type QueuedWrite } from "./sync";

export type OnboardingPath = "consumer" | "trainer_invite" | "gym_invite";
export type InvitationType = "trainer" | "gym";
export type InvitationStatus = "pending" | "accepted" | "expired" | "rejected" | "archived";

export interface TenantBrandingMetadata {
  tenantId: string;
  domain: string;
  brandName: string;
  primaryColor: string;
  accentColor: string;
}

export interface LandingContent {
  branding: TenantBrandingMetadata;
  sections: string[];
  ctas: string[];
  demoModes: Array<"consumer" | "trainer" | "gym">;
}

export interface InvitationMetadata {
  id: string;
  type: InvitationType;
  code: string;
  status: InvitationStatus;
  tenantId: string;
  tenantName: string;
  invitedBy: string;
  relationshipMetadata: Record<string, string>;
  expiresAt: string;
}

export interface OnboardingMetadata {
  selectedPath: OnboardingPath;
  steps: string[];
  accountModel: string[];
  relationshipMetadataOnly: boolean;
  completionPercentage: number;
}

const defaultBranding: TenantBrandingMetadata = {
  tenantId: "gymcord",
  domain: "default",
  brandName: "GymCord",
  primaryColor: "#7c3aed",
  accentColor: "#22d3ee",
};

const tenantBranding: TenantBrandingMetadata[] = [
  defaultBranding,
  { tenantId: "atlas-strength", domain: "atlasstrength.example.com", brandName: "Atlas Strength Club", primaryColor: "#f97316", accentColor: "#111827" },
  { tenantId: "summit-performance", domain: "summit.example.com", brandName: "Summit Performance", primaryColor: "#16a34a", accentColor: "#0f172a" },
];

const invitations: InvitationMetadata[] = [
  { id: "invite-trainer-pending", type: "trainer", code: "TRAINER-BETA", status: "pending", tenantId: "atlas-strength", tenantName: "Atlas Strength Club", invitedBy: "Coach Riley", relationshipMetadata: { role: "member", access: "trainer_coaching", dataOwnership: "user_owned" }, expiresAt: "2026-12-31T23:59:59.000Z" },
  { id: "invite-gym-pending", type: "gym", code: "GYM-BETA", status: "pending", tenantId: "summit-performance", tenantName: "Summit Performance", invitedBy: "Summit Front Desk", relationshipMetadata: { role: "member", access: "gym_membership", dataOwnership: "user_owned" }, expiresAt: "2026-12-31T23:59:59.000Z" },
  { id: "invite-trainer-accepted", type: "trainer", code: "TRAINER-ACCEPTED", status: "accepted", tenantId: "atlas-strength", tenantName: "Atlas Strength Club", invitedBy: "Coach Riley", relationshipMetadata: { acceptedAt: "metadata_only" }, expiresAt: "2026-12-31T23:59:59.000Z" },
  { id: "invite-gym-expired", type: "gym", code: "GYM-EXPIRED", status: "expired", tenantId: "summit-performance", tenantName: "Summit Performance", invitedBy: "Summit Front Desk", relationshipMetadata: { expiredReason: "time_window" }, expiresAt: "2025-01-01T00:00:00.000Z" },
  { id: "invite-trainer-rejected", type: "trainer", code: "TRAINER-REJECTED", status: "rejected", tenantId: "atlas-strength", tenantName: "Atlas Strength Club", invitedBy: "Coach Riley", relationshipMetadata: { rejectedBy: "user" }, expiresAt: "2026-12-31T23:59:59.000Z" },
  { id: "invite-gym-archived", type: "gym", code: "GYM-ARCHIVED", status: "archived", tenantId: "summit-performance", tenantName: "Summit Performance", invitedBy: "Summit Front Desk", relationshipMetadata: { archivedInsteadOfDeleted: "true" }, expiresAt: "2026-12-31T23:59:59.000Z" },
];

export class LandingRepository {
  getBrandingForDomain(domain = window.location.hostname): TenantBrandingMetadata {
    return tenantBranding.find((brand) => brand.domain === domain || domain.includes(brand.tenantId)) ?? defaultBranding;
  }

  getLandingContent(domain?: string): LandingContent {
    return {
      branding: this.getBrandingForDomain(domain),
      sections: ["hero", "features", "Atlas AI", "workout tracking", "nutrition", "progress", "community", "trainer platform", "gym platform", "testimonials placeholders", "pricing placeholders", "FAQ placeholders", "footer"],
      ctas: ["Start Personal Journey", "Join Your Trainer", "Join Your Gym"],
      demoModes: ["consumer", "trainer", "gym"],
    };
  }
}

export class InvitationRepository {
  list(): InvitationMetadata[] { return invitations; }
  validateCode(code: string, type?: InvitationType): InvitationMetadata | null {
    return invitations.find((invite) => invite.code.toLowerCase() === code.trim().toLowerCase() && (!type || invite.type === type)) ?? null;
  }
  archive(id: string): InvitationMetadata | null {
    const invite = invitations.find((item) => item.id === id);
    return invite ? { ...invite, status: "archived", relationshipMetadata: { ...invite.relationshipMetadata, archivedInsteadOfDeleted: "true" } } : null;
  }
}

export class PublicBetaOnboardingRepository {
  getMetadata(selectedPath: OnboardingPath = "consumer", pendingInvitation?: InvitationMetadata | null): OnboardingMetadata {
    return {
      selectedPath,
      steps: ["consumer path", "trainer invite path", "gym invite path", "profile step", "goals", "units", "experience", "relationship step", "finish / launch app"],
      accountModel: [
        "one permanent user account",
        "personal data user-owned",
        "gym/trainer relationships metadata-only",
        "leaving gym/trainer never deletes workouts, nutrition, progress, AI history, messages, or achievements",
      ],
      relationshipMetadataOnly: Boolean(pendingInvitation) || selectedPath !== "consumer",
      completionPercentage: pendingInvitation ? 78 : selectedPath === "consumer" ? 56 : 67,
    };
  }
  getOfflineQueue(): QueuedWrite[] { return offlineEngine.getQueue(); }
}

export const landingRepository = new LandingRepository();
export const invitationRepository = new InvitationRepository();
export const publicBetaOnboardingRepository = new PublicBetaOnboardingRepository();
