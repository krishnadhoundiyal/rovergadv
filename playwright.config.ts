import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1, timeout: 30000,
  forbidOnly: !!process.env.CI, retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', {open:'never'}]],
  use: { baseURL:'http://127.0.0.1:4173/', viewport:{width:1194,height:834}, hasTouch:true, trace:process.env.LOW_STORAGE?'off':'retain-on-failure', screenshot:'only-on-failure' },
  projects: [
    { name:'chromium',use:{browserName:'chromium',launchOptions:process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}} },
    { name:'webkit',use:{browserName:'webkit',isMobile:true} },
  ],
  webServer:{command:'npm run preview -- --port 4173 --strictPort',url:'http://127.0.0.1:4173/',reuseExistingServer:!process.env.CI,timeout:20000},
});
