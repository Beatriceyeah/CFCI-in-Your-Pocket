import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api, request, requestPage, setAccessToken } from "./client";
import type { ErrorCode } from "./types";

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  setAccessToken(null);
});

describe("api client", () => {
  it("unwraps the envelope on success", async () => {
    mockFetch(200, { data: { status: "ok" }, error: null });

    await expect(api.health()).resolves.toEqual({ status: "ok" });
  });

  it("returns items and meta for paginated responses", async () => {
    const meta = { page: 1, page_size: 20, total: 1 };
    mockFetch(200, { data: [{ id: "1" }], error: null, meta });

    await expect(requestPage("/products")).resolves.toEqual({ items: [{ id: "1" }], meta });
  });

  it("sends the bearer token when set", async () => {
    const fetchMock = mockFetch(200, { data: null, error: null });
    setAccessToken("abc");

    await request("GET", "/me");

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer abc");
  });

  const cases: [number, ErrorCode][] = [
    [400, "VALIDATION_ERROR"],
    [401, "UNAUTHENTICATED"],
    [403, "FORBIDDEN"],
    [404, "NOT_FOUND"],
    [405, "METHOD_NOT_ALLOWED"],
    [409, "CONFLICT"],
    [500, "INTERNAL_ERROR"],
  ];

  it.each(cases)("throws a typed ApiError for %i %s", async (status, code) => {
    mockFetch(status, { data: null, error: { code, message: "Nope", details: {} } });

    const error = await request("GET", "/x").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status, code, message: "Nope" });
  });

  it("throws INTERNAL_ERROR when the response is not the envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("oops", { status: 502 })));

    await expect(request("GET", "/x")).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
      status: 502,
    });
  });

  it("throws INTERNAL_ERROR when the network fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(request("GET", "/x")).rejects.toMatchObject({ code: "INTERNAL_ERROR", status: 0 });
  });
});
