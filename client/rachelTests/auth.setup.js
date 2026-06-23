import { test as setup, expect } from '@playwright/test';

// נתיב שבו נשמור את מצב ההתחברות (הסשן)
const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    // 1. נווט לדף הבית / ההתחברות
    await page.goto('http://localhost:5173/');

    // 2. פתיחת מודאל ההתחברות
    await page.getByRole('button', { name: 'Sign in' }).click();

    // 3. תהליך ההתחברות
    await page.locator('input[type="email"]').fill('rachel@gmail.com');
    await page.locator('input[type="password"]').fill('1234');
    await page.getByRole('button', { name: 'Login' }).click();

    // 4. ודא שהתחברנו בהצלחה (למשל, הופעת הלוגו StudyBuddy שמצביע על מעבר לדשבורד)
    await expect(page.getByText('StudyBuddy')).toBeVisible();

    // 5. שמירת הסשן לקובץ
    await page.context().storageState({ path: authFile });
});