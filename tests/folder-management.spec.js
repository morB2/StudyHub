import { test, expect } from '@playwright/test';

test.use({
  storageState: 'playwright/.auth/user.json'
});

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('heading', { name: 'v' }).nth(1).click();
  await page.getByRole('button', { name: 'חומרי לימוד' }).click();
  await page.getByRole('button', { name: 'צור תיקייה' }).click();
  await page.getByRole('textbox', { name: 'שם התיקייה' }).click();
  await page.getByRole('textbox', { name: 'שם התיקייה' }).fill('בדיקה טסט 196');
  await page.getByRole('button', { name: 'צור תיקייה' }).nth(1).click();
  await expect(page.getByRole('button', { name: 'בדיקה טסט' })).toBeVisible();
  await page.locator('div:nth-child(5) > .text-gray-300').click();
  await page.getByRole('button', { name: 'אישור' }).click();

console.log('--- [SUCCESS] Folder lifecycle test completed successfully: creation, verification, and deletion passed! ---');});
