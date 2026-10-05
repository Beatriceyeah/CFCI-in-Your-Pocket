import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductForm } from "./ProductForm";

function nth<T>(items: T[], index: number): T {
  const item = items[index];
  if (item === undefined) throw new Error(`Expected an element at index ${index}`);
  return item;
}

describe("ProductForm", () => {
  it("submits the filled-in fields", () => {
    const onSubmit = vi.fn();
    render(
      <ProductForm submitLabel="List my product" busy={false} error={null} onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByPlaceholderText("Loom"), { target: { value: "Aether" } });
    fireEvent.change(screen.getByPlaceholderText("Clinical trial matching in minutes"), {
      target: { value: "Open-source flight controller" },
    });
    const urlInputs = screen.getAllByPlaceholderText("https://...");
    fireEvent.change(nth(urlInputs, 0), { target: { value: "https://example.com/cover.png" } });
    fireEvent.change(nth(urlInputs, 1), { target: { value: "https://example.com/demo.mp4" } });
    fireEvent.change(screen.getByPlaceholderText(/What it does/), {
      target: { value: "A flight controller for student rocketry." },
    });

    fireEvent.click(screen.getByText("List my product"));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Aether",
      one_liner: "Open-source flight controller",
      cover_image_url: "https://example.com/cover.png",
      demo_video_url: "https://example.com/demo.mp4",
      brief: "A flight controller for student rocketry.",
      category: "software",
    });
  });

  it("shows the server error", () => {
    render(
      <ProductForm
        submitLabel="Save"
        busy={false}
        error="You already have a product"
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("You already have a product");
  });
});
