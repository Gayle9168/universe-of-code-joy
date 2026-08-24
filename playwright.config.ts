import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests for the visualizer player.
 *
 * These exist because the player cannot be proven by any server-side render: the
 * run is loaded in a mount effect, and zustand hands the server renderer
 * `getInitialState`, so `run` is null in server HTML by construction. The canvas
 * only exists after hydration, which means only a real browser can show it.
 *
 * Deliberately NOT part of `bun run verify` — it needs a dev server and a browser
 * binary, so it stays a separate `bun run test:e2e`.
 */
const PORT = 5187;

export default defineConfig({
  testDir: "./e2e",
  /* One worker: every test drives the same dev server, and the player writes step
     state back into the URL, so parallel navigation makes failures hard to read. */
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env["CI"],
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    /* Fixed viewport: the array canvas is width-responsive and the aux panels
       float over it, so overlap assertions need a known width. */
    viewport: { width: 1440, height: 900 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `bunx vite dev --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env["CI"],
    timeout: 180_000,
  },
});
