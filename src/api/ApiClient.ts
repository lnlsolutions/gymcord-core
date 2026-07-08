import { telemetryService } from "../core/analytics";
import { offlineEngine } from "../services/sync";
import { ApiError, type ApiClientOptions, type ApiRequest, type ApiResponse, type HttpMethod } from "./types";
import { RequestBuilder } from "./RequestBuilder";

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
  retryAttempts?: number;
  queueWhenOffline?: boolean;
}

export class ApiClient {
  private readonly timeoutMs: number;
  private readonly retryAttempts: number;

  constructor(private readonly options: ApiClientOptions) {
    this.timeoutMs = options.timeoutMs ?? 10_000;
    this.retryAttempts = options.retryAttempts ?? 2;
  }

  build(method: HttpMethod, path: string): RequestBuilder {
    return new RequestBuilder(method, path, { timeoutMs: this.timeoutMs, retryAttempts: this.retryAttempts });
  }

  get<T>(path: string, options?: ApiRequestOptions) { return this.send<T>(this.fromOptions("GET", path, undefined, options)); }
  post<TResponse, TBody = unknown>(path: string, body: TBody, options?: ApiRequestOptions) { return this.send<TResponse, TBody>(this.fromOptions("POST", path, body, options)); }
  patch<TResponse, TBody = unknown>(path: string, body: TBody, options?: ApiRequestOptions) { return this.send<TResponse, TBody>(this.fromOptions("PATCH", path, body, options)); }
  delete(path: string, options?: ApiRequestOptions) { return this.send<void>(this.fromOptions("DELETE", path, undefined, options)); }

  async send<TResponse, TBody = unknown>(request: ApiRequest<TBody>): Promise<ApiResponse<TResponse>> {
    let prepared: ApiRequest = request;
    for (const middleware of this.options.middleware ?? []) prepared = await (middleware.onRequest?.(prepared) ?? prepared);

    for (let attempt = 0; attempt <= prepared.retryAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), prepared.timeoutMs);
      const abort = () => controller.abort();
      prepared.signal?.addEventListener("abort", abort, { once: true });
      try {
        const requestStartedAt = performance.now();
        this.options.logger?.("api:request", { provider: this.options.provider.name, path: prepared.path, method: prepared.method, attempt });
        let response = await this.options.provider.request<TResponse>({ ...prepared, signal: controller.signal });
        for (const middleware of this.options.middleware ?? []) response = await (middleware.onResponse?.(response, prepared) ?? response);
        telemetryService.performance.trackApiLatency(prepared.path, performance.now() - requestStartedAt, String(response.status));
        return response;
      } catch (unknownError) {
        const apiError = unknownError instanceof ApiError ? unknownError : new ApiError("Request failed.", 500, "REQUEST_FAILED", unknownError);
        if (prepared.queuedWhenOffline && !navigator.onLine && prepared.method !== "GET") {
          const syncStartedAt = performance.now();
          offlineEngine.queueWrite({ entity: prepared.path, operation: prepared.method === "DELETE" ? "delete" : prepared.method === "POST" ? "create" : "update", payload: prepared.body });
          telemetryService.performance.trackOfflineSync(performance.now() - syncStartedAt);
          return { data: undefined as TResponse, status: 202, headers: {}, source: "cache" };
        }
        if (attempt < prepared.retryAttempts && (apiError.status >= 500 || apiError.code === "TIMEOUT")) continue;
        let handled = apiError;
        for (const middleware of this.options.middleware ?? []) handled = await (middleware.onError?.(handled, prepared) ?? handled);
        throw handled;
      } finally {
        window.clearTimeout(timeoutId);
        prepared.signal?.removeEventListener("abort", abort);
      }
    }
    throw new ApiError("Retry policy exhausted.", 500, "RETRY_EXHAUSTED");
  }

  private fromOptions<TBody>(method: HttpMethod, path: string, body?: TBody, options?: ApiRequestOptions): ApiRequest<TBody> {
    const builder = this.build(method, path).withHeaders(options?.headers ?? {}).withSignal(options?.signal).withTimeout(options?.timeoutMs ?? this.timeoutMs).withRetryAttempts(options?.retryAttempts ?? this.retryAttempts);
    if (body !== undefined) builder.withBody(body);
    if (options?.queueWhenOffline) builder.queueWhenOffline();
    return builder.build() as ApiRequest<TBody>;
  }
}
