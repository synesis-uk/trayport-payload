import 'dotenv/config'
import { defineConfig } from '@playwright/test'

const galleryPort = Number(process.env.PLAYWRIGHT_GALLERY_PORT || 3107)
const baseURL = `http://localhost:${galleryPort}`
const serverURL = `http://[::1]:${galleryPort}`

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
  forbidOnly: Boolean(process.env.CI),
  outputDir: 'test-results/gallery',
  preserveOutput: 'failures-only',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/gallery' }]],
  retries: process.env.CI ? 1 : 0,
  snapshotPathTemplate: '{testDir}/../visual/gallery/{projectName}/{arg}{ext}',
  testDir: './tests/gallery',
  testMatch: 'design-system-gallery.visual.spec.ts',
  timeout: 90_000,
  use: {
    baseURL,
    colorScheme: 'light',
    contextOptions: {
      reducedMotion: 'reduce',
    },
    deviceScaleFactor: 1,
    locale: 'en-GB',
    screenshot: 'only-on-failure',
    timezoneId: 'Europe/London',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'gallery-desktop',
      use: {
        viewport: { height: 1_000, width: 1_440 },
      },
    },
    {
      name: 'gallery-mobile',
      use: {
        hasTouch: true,
        isMobile: true,
        viewport: { height: 844, width: 390 },
      },
    },
  ],
  webServer: {
    command: `corepack pnpm exec next dev --hostname :: --port ${galleryPort}`,
    env: {
      ...process.env,
      DESIGN_SYSTEM_ENABLED: 'true',
      NEXT_PUBLIC_SERVER_URL: baseURL,
    },
    reuseExistingServer: false,
    timeout: 180_000,
    url: `${serverURL}/design-system/`,
  },
  workers: 1,
})
