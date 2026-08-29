import { defineConfig, devices } from "@playwright/test";

const FRONT_URL = process.env.FRONT_URL ?? "http://localhost:3000";
const API_URL = process.env.API_URL ?? "http://localhost:3001";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  use: {
    baseURL: FRONT_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "es-PE",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "npm run dev",
      url: FRONT_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm run start:dev",
      cwd: "../basictech-api",
      url: `${API_URL}/config`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
