import { defineConfig, devices } from '@playwright/test';

const port = 4173;

// Optional: point at an already-installed Chromium instead of the build
// `playwright install` downloads. Useful in containers that ship a browser.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

export default defineConfig({
  testDir: './e2e',
  forbidOnly: Boolean(process.env.CI),
  // No retries: a test that passes on the second try is a bug report, not a pass.
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${String(port)}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(executablePath ? { launchOptions: { executablePath } } : {}),
      },
    },
  ],
  // Builds the SPA and serves the production bundle, so the smoke test exercises
  // what actually ships rather than the dev server.
  //
  // Vite is invoked directly, with `exec`, rather than through `pnpm run`: pnpm
  // starts scripts in their own process group, so Playwright's teardown kill
  // misses the preview server and then waits out its full timeout.
  webServer: {
    cwd: 'apps/web',
    command: `./node_modules/.bin/vite build && exec ./node_modules/.bin/vite preview --port ${String(port)} --strictPort`,
    url: `http://localhost:${String(port)}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
