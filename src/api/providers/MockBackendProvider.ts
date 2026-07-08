import { ApiError, type ApiRequest, type ApiResponse, type BackendProvider } from "../types";

type Collection = Record<string, unknown>;

export class MockBackendProvider implements BackendProvider {
  readonly name = "mock";

  constructor(private readonly collections: Record<string, Collection> = {}) {}

  async request<TResponse, TBody = unknown>(request: ApiRequest<TBody>): Promise<ApiResponse<TResponse>> {
    if (request.signal?.aborted) throw new ApiError("Request was cancelled.", 499, "REQUEST_CANCELLED");
    const [collectionName, id, action] = request.path.replace(/^\//, "").split("/");
    const collection = this.collections[collectionName] ??= {};

    if (request.method === "GET") {
      const values = Object.values(collection);
      if (id === "slug" && action) {
        return this.response((values.find((record) => (record as { slug?: string }).slug === action) ?? null) as TResponse);
      }
      const data = id ? collection[id] ?? null : { items: values };
      return this.response(data as TResponse);
    }

    if (request.method === "POST") {
      const input = request.body as Record<string, unknown>;
      const recordId = String(input.id ?? crypto.randomUUID());
      const now = new Date().toISOString();
      const record = { ...input, id: recordId, createdAt: input.createdAt ?? now, updatedAt: now };
      collection[recordId] = record;
      return this.response(record as TResponse, 201);
    }

    if (request.method === "PATCH") {
      if (!id) throw new ApiError("Record id is required for updates.", 400, "MISSING_ID");
      const existing = collection[id] as Record<string, unknown> | undefined;
      if (!existing) throw new ApiError(`Record ${id} was not found.`, 404, "NOT_FOUND");
      const record = { ...existing, ...(request.body as Record<string, unknown>), updatedAt: new Date().toISOString() };
      collection[id] = record;
      return this.response(record as TResponse);
    }

    if (request.method === "DELETE") {
      if (!id) throw new ApiError("Record id is required for deletes.", 400, "MISSING_ID");
      delete collection[id];
      return this.response(undefined as TResponse, 204);
    }

    throw new ApiError(`Unsupported mock request: ${request.method} ${request.path}`, 400, "UNSUPPORTED_REQUEST");
  }

  private response<T>(data: T, status = 200): ApiResponse<T> {
    return { data, status, headers: {}, source: "mock" };
  }
}
