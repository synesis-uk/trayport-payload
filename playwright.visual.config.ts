import 'dotenv/config'
import { defineConfig } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000'
const startLocalServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER !== 'true'

export default defineConfig({
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },
  fullyParallel: false,
  outputDir: 'output/playwright/visual-results',
  preserveOutput: 'failures-only',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'output/playwright/visual-report' }],
  ],
  snapshotPathTemplate: '{testDir}/../visual/reference/{projectName}/{arg}{ext}',
  testDir: './tests/e2e',
  testMatch: 'visual-regression.e2e.spec.ts',
  timeout: 90_000,
  use: {
    baseURL,
    colorScheme: 'light',
    deviceScaleFactor: 1,
    locale: 'en-GB',
    contextOptions: {
      reducedMotion: 'reduce',
    },
    screenshot: 'only-on-failure',
    timezoneId: 'Europe/London',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'visual-desktop',
      use: { viewport: { height: 1_000, width: 1_440 } },
    },
    {
      name: 'visual-mobile',
      use: {
        hasTouch: true,
        isMobile: true,
        viewport: { height: 844, width: 390 },
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
  workers: 1,
})
