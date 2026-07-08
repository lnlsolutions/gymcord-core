import { ApiError, type ApiRequest, type ApiResponse, type BackendProvider } from "../../api";
import { getSupabaseClient } from "../../config/supabase";

const trimPath = (path: string) => path.replace(/^\/+|\/+$/g, "");
const tableFromPath = (path: string) => trimPath(path).split("/")[0]?.replace(/-/g, "_");
const idFromPath = (path: string) => trimPath(path).split("/")[1];

export class SupabaseDatabaseProvider implements BackendProvider {
  readonly name = "supabase";

  async request<TResponse, TBody = unknown>(request: ApiRequest<TBody>): Promise<ApiResponse<TResponse>> {
    const table = tableFromPath(request.path);
    if (!table) throw new ApiError(`Invalid Supabase path: ${request.path}`, 400, "SUPABASE_INVALID_PATH");

    const client = getSupabaseClient();
    const id = idFromPath(request.path);
    let query = client.from(table);
    let result: { data: unknown; error: { message: string; code?: string } | null; status?: number };

    if (request.method === "GET") {
      if (id === "slug") {
        const slug = trimPath(request.path).split("/")[2];
        result = await query.select("*").eq("slug", slug).maybeSingle();
      } else if (id) {
        result = await query.select("*").eq("id", id).maybeSingle();
      } else {
        result = await query.select("*");
        result = { ...result, data: { items: result.data ?? [] } };
      }
    } else if (request.method === "POST") {
      result = await query.insert(request.body as never).select("*").single();
    } else if (request.method === "PATCH") {
      result = await query.update(request.body as never).eq("id", id ?? "").select("*").single();
    } else if (request.method === "DELETE") {
      result = await query.delete().eq("id", id ?? "");
    } else {
      throw new ApiError(`Unsupported Supabase method: ${request.method}`, 405, "SUPABASE_UNSUPPORTED_METHOD");
    }

    if (result.error) throw new ApiError(result.error.message, result.status ?? 500, result.error.code ?? "SUPABASE_ERROR");
    return { data: result.data as TResponse, status: result.status ?? 200, headers: {}, source: "remote" };
  }
}
