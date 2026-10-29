/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Inline images so the single-file HTML build stays self-contained.
  build: { assetsInlineLimit: 1_000_000 },
  test: { environment: "node" },
});
