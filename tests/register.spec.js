import { test, expect } from '@playwright/test';

test('User Registration - Success', async ({ page }) => {
  // 1. תנאי התחלה (Pre-condition): הגעה לדף הבית
  await page.goto('http://localhost:5173/');

  // 2. לחיצה על כפתור ההתחברות כדי לפתוח את החלונית
  await page.getByRole('button', { name: 'Sign in' }).click();

  // 3. מעבר למסך ההרשמה (עכשיו הכפתור כבר יופיע במסך)
  await page.getByRole('button', { name: "Don't have an account?" }).click();

  // יצירת אימייל ייחודי לטסט הנוכחי למניעת שגיאת "משתמש קיים"
  const uniqueEmail = `testuser_${Date.now()}@gmail.com`;

  // 4. מילוי שדות הטופס
  await page.getByRole('textbox', { name: 'email@example.com' }).fill(uniqueEmail);
  await page.getByRole('textbox', { name: '••••••••' }).fill('1234');

  // 5. שליחת טופס ההרשמה
  await page.getByRole('button', { name: 'Register' }).click();

  // 6. אימות התוצאה (Assertion)
  // לאחר ההרשמה מוודאים שהמערכת החזירה את החלונית למצב "Login" (התחברות)
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});