import { apiClient } from "../api/client";
import { appConfig } from "../config";
import { keyValueStorage } from "../services/storage";

export interface LandingBranding {
  name: string;
  tagline: string;
  accent: string;
  logoText: string;
  mode: "consumer" | "trainer" | "gym";
  tenantId?: string;
  domain?: string;
}

export interface LandingSection {
  id: string;
  title: string;
  description: string;
}

export interface LandingExperience {
  activeProvider: string;
  branding: LandingBranding;
  sections: LandingSection[];
  ctas: { label: string; path: "consumer" | "trainer" | "gym" }[];
}

const tenantStorageKey = "gc.publicBeta.tenantMetadata";

function defaultBranding(): LandingBranding {
  return { name: "GymCord", tagline: "One account for workouts, nutrition, progress, community, trainers, and gyms.", accent: "#f97316", logoText: "GC", mode: "consumer" };
}

export class LandingRepository {
  detectBranding(hostname = window.location.hostname): LandingBranding {
    const metadata = keyValueStorage.get<Partial<LandingBranding>>(tenantStorageKey, {});
    if (metadata.name) return { ...defaultBranding(), ...metadata, mode: metadata.mode ?? "gym", domain: hostname };
    if (hostname.includes("trainer")) return { name: "Atlas Strength Coaching", tagline: "Join your trainer without giving up your personal GymCord account.", accent: "#8b5cf6", logoText: "AS", mode: "trainer", tenantId: "trainer-atlas", domain: hostname };
    if (hostname.includes("gym")) return { name: "Summit Barbell Club", tagline: "A member app that keeps your training history yours forever.", accent: "#22c55e", logoText: "SB", mode: "gym", tenantId: "gym-summit", domain: hostname };
    return defaultBranding();
  }

  async getExperience(hostname = window.location.hostname): Promise<LandingExperience> {
    const branding = this.detectBranding(hostname);
    if (branding.tenantId) {
      void apiClient.get(`/tenants/${branding.tenantId}`, { queueWhenOffline: true }).catch(() => undefined);
    }
    return {
      activeProvider: appConfig.backend.provider,
      branding,
      ctas: [
        { label: "Start Personal Journey", path: "consumer" },
        { label: "Join Your Trainer", path: "trainer" },
        { label: "Join Your Gym", path: "gym" },
      ],
      sections: ["Atlas AI", "Workout Tracking", "Nutrition", "Progress", "Community", "Trainer Platform", "Gym Platform", "Testimonials", "Pricing", "FAQ"].map((title, index) => ({ id: title.toLowerCase().replace(/ /g, "-"), title, description: index > 6 ? "Placeholder content for beta launch iteration." : `SaaS-ready ${title.toLowerCase()} built around one permanent user-owned account.` })),
    };
  }
}

export const landingRepository = new LandingRepository();
