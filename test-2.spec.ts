import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://pagespeed.web.dev/');
  await page.getByPlaceholder('Enter a web page URL').click();
  await page.getByPlaceholder('Enter a web page URL').fill('https://www.xenonstack.com/');
  await page.getByRole('button', { name: 'Analyze' }).click({ timeout: 120000 });
  // await page.getByRole('link', { name: '63 Performance' }).click({ timeout: 28318000 });
  await page.getByLabel('smartphoneMobile').locator('#performance').getByText('Performance', { exact: true }).click({ timeout: 283180 });
  await page.getByRole('link', { name: '92 Accessibility' }).click({ timeout: 283180 });
});