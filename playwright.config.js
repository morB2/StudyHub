// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    // 1. הגדרת פרויקט ההתחברות (Setup) שירוץ תמיד ראשון וישמור את הסשן
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
    },

    // 2. דפדפני הבדיקה הרגילים - רצים ללא ה-SETUP
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/auth.setup.js', '**/file-management.spec.js', '**/folder-management.spec.js', '**/meetings.spec.js'],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: ['**/auth.setup.js', '**/file-management.spec.js', '**/folder-management.spec.js', '**/meetings.spec.js'],
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: ['**/auth.setup.js', '**/file-management.spec.js', '**/folder-management.spec.js', '**/meetings.spec.js'],
    },

    // 3. דפדפני הבדיקה לטסטים של רחל - תלויים ב-setup ומשתמשים בקובץ השמור
    {
      name: 'chromium-auth',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json', // משתמש בסשן המחובר
      },
      testMatch: ['**/file-management.spec.js', '**/folder-management.spec.js', '**/meetings.spec.js'],
      dependencies: ['setup'], // רץ רק אחרי שה-setup מסתיים בהצלחה
    },

    {
      name: 'firefox-auth',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      testMatch: ['**/file-management.spec.js', '**/folder-management.spec.js', '**/meetings.spec.js'],
      dependencies: ['setup'],
    },

    {
      name: 'webkit-auth',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'playwright/.auth/user.json',
      },
      testMatch: ['**/file-management.spec.js', '**/folder-management.spec.js', '**/meetings.spec.js'],
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

