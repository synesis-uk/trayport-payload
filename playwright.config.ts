import 'dotenv/config'
import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const startLocalServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER !== 'true'

export default defineConfig({
  testDir: './tests/e2e',
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  outputDir: 'test-results',
  preserveOutput: 'failures-only',
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  retries: process.env.CI ? 2 : 0,
  testIgnore: 'visual-regression.e2e.spec.ts',
  timeout: 60_000,
  use: {
    baseURL,
    colorScheme: 'light',
    contextOptions: {
      reducedMotion: 'reduce',
    },
    locale: 'en-GB',
    screenshot: 'only-on-failure',
    timezoneId: 'Europe/London',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {
          height: 1_000,
          width: 1_440,
        },
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 5'],
        viewport: {
          height: 800,
          width: 320,
        },
      },
    },
  ],
  webServer: startLocalServer
    ? {
        command: 'corepack pnpm dev',
        env: {
          ...process.env,
          NEXT_PUBLIC_SERVER_URL: baseURL,
        },
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        url: baseURL,
      }
    : undefined,
  workers: process.env.CI ? 2 : 3,
})
