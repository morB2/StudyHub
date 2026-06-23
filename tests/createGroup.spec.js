// @ts-check
import { test, expect } from '@playwright/test';

test('Create a group and verify it can be searched and viewed', async ({ page }) => {
  const timestamp = Date.now();
  const testEmail = `e2e_user_${timestamp}@example.com`;
  const testPassword = 'Password123';
  const groupName = `קבוצת בדיקה E2E ${timestamp}`;
  const subjectName = `בדיקות תוכנה ${timestamp}`;
  const description = `תיאור קבוצת בדיקה מקצה לקצה - ${timestamp}`;

  // 1. Navigate to the application
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/client/);

  // 2. Click on "Sign in" to open Auth modal
  await page.getByRole('button', { name: 'Sign in' }).click();

  // 3. Switch to Register mode by clicking "Register" toggle link
  await page.locator('span:has-text("Register")').click();

  // 4. Fill email and password for registration
  await page.locator('input[type="email"]').fill(testEmail);
  await page.locator('input[type="password"]').fill(testPassword);

  // 5. Submit registration form
  await page.locator('button[type="submit"]:has-text("Register")').click();

  // 6. Wait for the server response and redirect back to Login (mode changes after 2s)
  await expect(page.locator('button[type="submit"]')).toHaveText('Login', { timeout: 6000 });

  // 7. Password is cleared during redirect to login, so fill it again
  await page.locator('input[type="password"]').fill(testPassword);

  // 8. Submit login form
  await page.locator('button[type="submit"]:has-text("Login")').click();

  // 9. Verify the user is logged in by checking the presence of the logout button (התנתק)
  await expect(page.locator('button:has-text("התנתק")')).toBeVisible({ timeout: 5000 });

  // 10. Click on "Create Group" button ("יצירת קבוצה")
  await page.getByRole('button', { name: 'יצירת קבוצה' }).click();

  // 11. Fill in the group details in the modal
  await page.getByPlaceholder('לדוגמה: מבוא למדעי המחשב').fill(groupName);
  await page.getByPlaceholder('לדוגמה: מדמ"ח 101').fill(subjectName);
  await page.getByPlaceholder('בשביל מה הקבוצה? שתפו מטרות, זמני מפגשים וכו\'.').fill(description);

  // 12. Submit the group creation form
  await page.locator('button[type="submit"]:has-text("יצירת קבוצה")').click();

  // 13. Wait for the creation modal to close
  await expect(page.getByPlaceholder('לדוגמה: מבוא למדעי המחשב')).not.toBeVisible({ timeout: 5000 });

  // 14. Locate the search input
  const searchInput = page.getByPlaceholder('חיפוש לפי שם או מקצוע...');
  await expect(searchInput).toBeVisible();

  // 15. Search for the newly created group name
  await searchInput.fill(groupName);

  // 16. Verify the group card appears in the search results
  const groupCardHeader = page.locator(`h3:has-text("${groupName}")`);
  await expect(groupCardHeader).toBeVisible({ timeout: 5000 });

  // 17. Click the group card to enter the group
  await groupCardHeader.click();

  // 18. Verify the user successfully entered the group page by asserting the group title in the detail view
  await expect(page.locator('h1', { hasText: groupName })).toBeVisible({ timeout: 5000 });

  // 19. Also verify that tabs such as "צ'אט" and "חומרי לימוד" are visible in the detail view
  await expect(page.locator('button:has-text("צ\'אט")')).toBeVisible();
  await expect(page.locator('button:has-text("חומרי לימוד")')).toBeVisible();
});
