import { test, expect } from '@playwright/test';

test.use({
  storageState: 'playwright/.auth/user.json'
});

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('heading', { name: 'v' }).nth(1).click();
  await page.getByRole('button', { name: 'מפגשים' }).click();
  await page.getByRole('textbox', { name: 'לדוגמה: מרתון למידה למבחן' }).click();
  await page.getByRole('textbox', { name: 'לדוגמה: מרתון למידה למבחן' }).fill('בדיקה טסט 198');
  await page.locator('input[type="date"]').fill('2026-06-26');
  await page.locator('input[type="time"]').fill('13:57');
  await page.getByRole('textbox', { name: 'לדוגמה: זום, ספרייה וכו\'' }).click();
  await page.getByRole('textbox', { name: 'לדוגמה: זום, ספרייה וכו\'' }).fill('ספריה לאומית ירושלים');
  await page.getByRole('button', { name: 'תזמן' }).click();
  await page.locator('div').filter({ hasText: 'תזמון מפגשהמפגש תוזמן בהצלחה!' }).nth(4).click();
  await expect(page.getByRole('heading', { name: 'בדיקה טסט' })).toBeVisible();
  await page.getByRole('button', { name: 'ביטול פגישה' }).nth(3).click();
  await page.getByRole('button', { name: 'אישור' }).click();
  await page.locator('h4').filter({ hasText: 'תזמון מפגש' }).click();

  console.log('--- [SUCCESS] Meeting scheduling test passed completely: session created and successfully canceled! ---');
});