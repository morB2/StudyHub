import { test, expect } from '@playwright/test';

test('User Logout - Success', async ({ page }) => {
  // 1. שלב ההכנה (Setup): התחברות למערכת
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'email@example.com' }).fill('test@gmail.com');
  await page.getByRole('textbox', { name: '••••••••' }).fill('1234');
  await page.getByRole('button', { name: 'Login' }).click();

  // מוודאים שההתחברות הצליחה לפני שממשיכים להתנתקות
  const logoutButton = page.getByRole('button', { name: 'התנתק' });
  await expect(logoutButton).toBeVisible();

  // 2. הפעולה הנבדקת (Action): לחיצה על כפתור ההתנתקות
  await logoutButton.click();

  // 3. אימות התוצאה (Assertion)
  // נוודא שהמערכת החזירה את המשתמש למצב ההתחלתי (כפתור Sign in חזר להופיע)
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  
  // בנוסף, נוודא שכפתור "התנתק" כבר לא מופיע על המסך
  await expect(logoutButton).toBeHidden();
});