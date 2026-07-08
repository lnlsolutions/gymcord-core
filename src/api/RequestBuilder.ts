import type { ApiRequest, HttpMethod } from "./types";

export class RequestBuilder<TBody = unknown> {
  private request: ApiRequest<TBody>;

  constructor(method: HttpMethod, path: string, defaults: Pick<ApiRequest, "timeoutMs" | "retryAttempts">) {
    this.request = { method, path, headers: {}, timeoutMs: defaults.timeoutMs, retryAttempts: defaults.retryAttempts, queuedWhenOffline: false };
  }

  withBody(body: TBody): this {
    this.request.body = body;
    return this;
  }

  withHeaders(headers: Record<string, string>): this {
    this.request.headers = { ...this.request.headers, ...headers };
    return this;
  }

  withSignal(signal?: AbortSignal): this {
    this.request.signal = signal;
    return this;
  }

  withTimeout(timeoutMs: number): this {
    this.request.timeoutMs = timeoutMs;
    return this;
  }

  withRetryAttempts(retryAttempts: number): this {
    this.request.retryAttempts = retryAttempts;
    return this;
  }

  queueWhenOffline(enabled = true): this {
    this.request.queuedWhenOffline = enabled;
    return this;
  }

  build(): ApiRequest<TBody> {
    return { ...this.request, headers: { ...this.request.headers } };
  }
}
