import { ApiError, type ApiRequest, type ApiResponse, type BackendProvider } from "../types";

export class FirebaseProvider implements BackendProvider {
  readonly name = "firebase";
  constructor(private readonly projectId?: string) {}

  async request<TResponse, TBody = unknown>(_request: ApiRequest<TBody>): Promise<ApiResponse<TResponse>> {
    if (!this.projectId) throw new ApiError("Firebase is not configured.", 501, "FIREBASE_NOT_CONFIGURED");
    throw new ApiError("FirebaseProvider is a backend stub awaiting adapter implementation.", 501, "FIREBASE_STUB");
  }
}
