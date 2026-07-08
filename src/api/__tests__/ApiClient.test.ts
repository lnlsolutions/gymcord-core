import { describe, expect, it, vi } from "vitest";
import { ApiClient } from "../ApiClient";
import type { BackendProvider } from "../types";

describe("ApiClient", () => {
  it("sends requests through middleware and provider", async () => {
    const provider: BackendProvider = { name: "mock", request: vi.fn(async (request) => ({ data: { path: request.path }, status: 200, headers: {}, source: "mock" })) };
    const client = new ApiClient({ provider, retryAttempts: 0, middleware: [{ onRequest: (request) => ({ ...request, headers: { ...request.headers, "x-test": "yes" } }) }] });
    const response = await client.get<{ path: string }>("/members");
    expect(response.data.path).toBe("/members");
    expect(provider.request).toHaveBeenCalledWith(expect.objectContaining({ headers: expect.objectContaining({ "x-test": "yes" }) }));
  });
});
