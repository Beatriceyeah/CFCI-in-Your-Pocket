import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "../api/client";
import { HomePage } from "./HomePage";

afterEach(() => vi.restoreAllMocks());

describe("HomePage", () => {
  it("shows connected when the API is healthy", async () => {
    vi.spyOn(api, "health").mockResolvedValue({ status: "ok" });

    render(<HomePage />);

    expect(await screen.findByText("API connected.")).toBeInTheDocument();
  });

  it("shows the error message from the API client", async () => {
    vi.spyOn(api, "health").mockRejectedValue(
      new ApiError(500, { code: "INTERNAL_ERROR", message: "Something went wrong", details: {} }),
    );

    render(<HomePage />);

    expect(await screen.findByText("API unavailable: Something went wrong")).toBeInTheDocument();
  });
});
