import { appConfig } from "../config";
import { defaultOrganization } from "../repositories/OrganizationRepository";
import { ApiClient } from "./ApiClient";
import { FirebaseProvider, MockBackendProvider, RESTProvider, SupabaseProvider } from "./providers";
import type { ApiMiddleware, BackendProvider } from "./types";

export function createBackendProvider(): BackendProvider {
  switch (appConfig.backend.provider) {
    case "supabase": return new SupabaseProvider(appConfig.backend.supabase.url, appConfig.backend.supabase.anonKey);
    case "firebase": return new FirebaseProvider(appConfig.backend.firebase.projectId);
    case "rest": return new RESTProvider(appConfig.backend.endpoints.apiBaseUrl);
    case "mock":
    default:
      return new MockBackendProvider({ organizations: { [defaultOrganization.id]: defaultOrganization } });
  }
}

const errorMiddleware: ApiMiddleware = {
  onError(error) {
    console.error(`[GymCord API] ${error.code}: ${error.message}`);
    return error;
  },
};

export const apiClient = new ApiClient({
  provider: createBackendProvider(),
  middleware: [errorMiddleware],
  timeoutMs: appConfig.backend.timeoutMs,
  retryAttempts: appConfig.backend.retryAttempts,
  logger: appConfig.environment === "development" ? (event, meta) => console.debug(`[GymCord] ${event}`, meta) : undefined,
});
