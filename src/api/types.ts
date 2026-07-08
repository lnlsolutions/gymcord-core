export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
  source: "cache" | "remote" | "mock";
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
    public readonly code = "API_ERROR",
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiRequest<TBody = unknown> {
  method: HttpMethod;
  path: string;
  body?: TBody;
  headers: Record<string, string>;
  timeoutMs: number;
  retryAttempts: number;
  signal?: AbortSignal;
  queuedWhenOffline: boolean;
}

export interface ApiMiddleware {
  onRequest?<TBody>(request: ApiRequest<TBody>): ApiRequest<TBody> | Promise<ApiRequest<TBody>>;
  onResponse?<T>(response: ApiResponse<T>, request: ApiRequest): ApiResponse<T> | Promise<ApiResponse<T>>;
  onError?(error: ApiError, request: ApiRequest): ApiError | Promise<ApiError>;
}

export interface BackendProvider {
  readonly name: string;
  request<TResponse, TBody = unknown>(request: ApiRequest<TBody>): Promise<ApiResponse<TResponse>>;
}

export interface ApiClientOptions {
  provider: BackendProvider;
  middleware?: ApiMiddleware[];
  timeoutMs?: number;
  retryAttempts?: number;
  logger?: (event: string, meta: Record<string, unknown>) => void;
}
