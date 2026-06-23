import { test, expect } from '@playwright/test';

test.use({
  storageState: 'playwright/.auth/user.json'
});

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('heading', { name: 'v' }).nth(1).click();
  await page.getByRole('button', { name: 'חומרי לימוד' }).click();
  await page.getByText('Drag & drop a file here').click();
  await page.locator('input[type="file"]').setInputFiles('בדיקה טסט 197.pdf');
  await page.getByRole('button', { name: 'שתף' }).click();
  await expect(page.getByText('בדיקה טסט 197.pdf').first()).toBeVisible();
  await page.locator('.p-1\\.5.text-gray-300.hover\\:text-red-500').first().click();
  await page.getByRole('button', { name: 'אישור' }).click();
  await expect(page.getByText('הקובץ נמחק').first()).toBeVisible();

  console.log('--- [SUCCESS] File management flow executed flawlessly: upload validated and file successfully removed! ---');
});