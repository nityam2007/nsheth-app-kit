import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  workers: 1,
  use: {
    baseURL: process.env.TEST_URL ?? "http://localhost:3001",
    browserName: "firefox",
    trace: "retain-on-failure",
  },
});
