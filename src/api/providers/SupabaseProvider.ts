import { ApiError, type ApiRequest, type ApiResponse, type BackendProvider } from "../types";

export class SupabaseProvider implements BackendProvider {
  readonly name = "supabase";
  constructor(private readonly url?: string, private readonly anonKey?: string) {}

  async request<TResponse, TBody = unknown>(_request: ApiRequest<TBody>): Promise<ApiResponse<TResponse>> {
    if (!this.url || !this.anonKey) throw new ApiError("Supabase is not configured.", 501, "SUPABASE_NOT_CONFIGURED");
    throw new ApiError("SupabaseProvider is a backend stub awaiting adapter implementation.", 501, "SUPABASE_STUB");
  }
}
