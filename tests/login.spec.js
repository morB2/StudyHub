import { test, expect } from '@playwright/test';

test('User Login - Success', async ({ page }) => {
  // 1. תנאי התחלה: ניווט לדף הבית
  await page.goto('http://localhost:5173/');

  // 2. פתיחת חלונית ההתחברות
  await page.getByRole('button', { name: 'Sign in' }).click();

  // 3. הזנת נתוני משתמש קיים (יש לוודא שהמשתמש הזה אכן נוצר במערכת מראש)
  await page.getByRole('textbox', { name: 'email@example.com' }).fill('test@gmail.com');
  await page.getByRole('textbox', { name: '••••••••' }).fill('1234');

  // 4. לחיצה על התחברות
  await page.getByRole('button', { name: 'Login' }).click();

  // 5. אימות התוצאה (Assertion)
  // לפי ההקלטה שלך, לאחר התחברות מוצלחת מופיע כפתור "התנתק". נוודא שהוא אכן מופיע במסך.
  await expect(page.getByRole('button', { name: 'התנתק' })).toBeVisible();
});