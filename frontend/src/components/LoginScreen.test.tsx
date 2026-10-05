import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "../api/client";
import { AuthProvider } from "../context/AuthContext";
import { LoginScreen } from "./LoginScreen";

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("LoginScreen", () => {
  it("signs in with the chosen provider", async () => {
    const demoLogin = vi.spyOn(api.auth, "demoLogin").mockResolvedValue({
      access_token: "jwt",
      token_type: "bearer",
      user: {
        id: "u1",
        name: "Demo Student",
        email: "demo.student@duke.edu",
        auth_provider: "duke_netid",
        role: "student",
        interested_directions: [],
        onboarded: false,
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>,
    );

    fireEvent.click(await screen.findByText("Sign in with Duke NetID"));

    expect(demoLogin).toHaveBeenCalledWith({ provider: "duke_netid" });
    await waitFor(() => expect(localStorage.getItem("cfci_access_token")).toBe("jwt"));
  });

  it("shows an error message when sign-in fails", async () => {
    vi.spyOn(api.auth, "demoLogin").mockRejectedValue(
      new ApiError(500, { code: "INTERNAL_ERROR", message: "Something went wrong", details: {} }),
    );

    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>,
    );

    fireEvent.click(await screen.findByText("Sign in with LinkedIn"));

    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
  });
});
