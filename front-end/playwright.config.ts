import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests-e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  timeout: 30000,

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'pnpm start',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'dotnet run --project ../back-end/API-LMS/API-LMS',
      url: 'http://localhost:5275/swagger/v1/swagger.json',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
