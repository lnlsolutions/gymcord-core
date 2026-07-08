import { ApiError, type ApiRequest, type ApiResponse, type BackendProvider } from "../types";

export class RESTProvider implements BackendProvider {
  readonly name = "rest";
  constructor(private readonly baseUrl: string) {}

  async request<TResponse, TBody = unknown>(request: ApiRequest<TBody>): Promise<ApiResponse<TResponse>> {
    const response = await fetch(new URL(request.path.replace(/^\//, ""), this.baseUrl).toString(), {
      method: request.method,
      headers: { "Content-Type": "application/json", ...request.headers },
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
      signal: request.signal,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : undefined;
    if (!response.ok) throw new ApiError(data?.message ?? response.statusText, response.status, data?.code ?? "REST_ERROR", data);
    return { data: data as TResponse, status: response.status, headers: Object.fromEntries(response.headers.entries()), source: "remote" };
  }
}
