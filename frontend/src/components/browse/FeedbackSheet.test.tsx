import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "../../api/client";
import type { ProductCard } from "../../api/types";
import { FeedbackSheet } from "./FeedbackSheet";

const PRODUCT: ProductCard = {
  id: "p1",
  name: "Loom",
  one_liner: "Clinical trial matching in minutes",
  cover_image_url: "https://example.com/cover.png",
  category: "health",
};

afterEach(() => vi.restoreAllMocks());

describe("FeedbackSheet", () => {
  it("submits the selected reactions and comment", async () => {
    const give = vi.spyOn(api.feedback, "give").mockResolvedValue({
      product_id: "p1",
      would_use: true,
      would_invest: false,
      would_intro: false,
      comment: "Love this",
      created_at: "now",
    });
    const onDone = vi.fn();

    render(<FeedbackSheet product={PRODUCT} onDone={onDone} />);

    fireEvent.click(screen.getByText("Would use"));
    fireEvent.change(screen.getByPlaceholderText("What stood out to you?"), {
      target: { value: "Love this" },
    });
    fireEvent.click(screen.getByText("Send feedback"));

    await waitFor(() =>
      expect(give).toHaveBeenCalledWith("p1", {
        would_use: true,
        would_invest: false,
        would_intro: false,
        comment: "Love this",
      }),
    );
    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });

  it("closes without submitting on Skip", () => {
    const give = vi.spyOn(api.feedback, "give");
    const onDone = vi.fn();

    render(<FeedbackSheet product={PRODUCT} onDone={onDone} />);
    fireEvent.click(screen.getByText("Skip"));

    expect(give).not.toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
  });

  it("treats an already-given-feedback conflict as done", async () => {
    vi.spyOn(api.feedback, "give").mockRejectedValue(
      new ApiError(409, { code: "CONFLICT", message: "Already given", details: {} }),
    );
    const onDone = vi.fn();

    render(<FeedbackSheet product={PRODUCT} onDone={onDone} />);
    fireEvent.click(screen.getByText("Send feedback"));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });
});
