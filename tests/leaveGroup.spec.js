// @ts-check
import { test, expect } from '@playwright/test';

test('Leave a public group and verify UI updates accordingly', async ({ page }) => {
  const timestamp = Date.now();
  const testEmail = `e2e_user_${timestamp}@example.com`;
  const testPassword = 'Password123';
  const groupName = `קבוצה ציבורית לבדיקת עזיבה ${timestamp}`;
  const subjectName = `עזיבה ${timestamp}`;
  const description = `תיאור קבוצה ציבורית לבדיקת עזיבה`;

  // 1. Navigate to the application
  await page.goto('http://localhost:5173');
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', exception => console.error('BROWSER ERROR:', exception.message));
  await expect(page).toHaveTitle(/client/);

  // 2. Open login modal and register a new user
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.locator('span:has-text("Register")').click();
  await page.locator('input[type="email"]').fill(testEmail);
  await page.locator('input[type="password"]').fill(testPassword);
  await page.locator('button[type="submit"]:has-text("Register")').click();

  // 3. Wait for redirect and log in
  await expect(page.locator('button[type="submit"]')).toHaveText('Login', { timeout: 6000 });
  await page.locator('input[type="password"]').fill(testPassword);
  await page.locator('button[type="submit"]:has-text("Login")').click();

  // 4. Verify login and create a new public group
  await expect(page.locator('button:has-text("התנתק")')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'יצירת קבוצה' }).click();
  await page.getByPlaceholder('לדוגמה: מבוא למדעי המחשב').fill(groupName);
  await page.getByPlaceholder('לדוגמה: מדמ"ח 101').fill(subjectName);
  await page.getByPlaceholder('בשביל מה הקבוצה? שתפו מטרות, זמני מפגשים וכו\'.').fill(description);
  
  // Note: The public option is selected by default, so we just submit
  await page.locator('button[type="submit"]:has-text("יצירת קבוצה")').click();

  // 5. Wait for the creation modal to close
  await expect(page.getByPlaceholder('לדוגמה: מבוא למדעי המחשב')).not.toBeVisible({ timeout: 5000 });

  // 6. Search for the newly created group to locate its card on the dashboard
  const searchInput = page.getByPlaceholder('חיפוש לפי שם או מקצוע...');
  await searchInput.fill(groupName);
  
  // Verify that the group card is visible and has a member count of 1
  const groupCardHeader = page.locator(`h3:has-text("${groupName}")`);
  await expect(groupCardHeader).toBeVisible({ timeout: 5000 });
  
  const groupCard = page.locator('div.group', { has: groupCardHeader });
  const memberCountLocator = groupCard.locator('text=1 משתתפים');
  await expect(memberCountLocator).toBeVisible();

  // 7. Click on the "עזוב קבוצה" button (UserMinus icon button) on the group card
  const leaveButton = groupCard.locator('button[title="עזוב קבוצה"]');
  await expect(leaveButton).toBeVisible();
  await leaveButton.click();

  // 8. Confirm the action in the confirmation modal
  // ConfirmModal has confirm button with text "אישור"
  const confirmBtn = page.locator('button:has-text("אישור")');
  await expect(confirmBtn).toBeVisible();
  await confirmBtn.click();

  // 9. Verify that the UI updates successfully
  // The member count should decrease to 0
  const zeroMemberCountLocator = groupCard.locator('text=0 משתתפים');
  await expect(zeroMemberCountLocator).toBeVisible({ timeout: 5000 });

  // The leave button should change into a join button (with title "הצטרף לקבוצה")
  const joinButton = groupCard.locator('button[title="הצטרף לקבוצה"]');
  await expect(joinButton).toBeVisible();

  // 10. Click the group card to try entering it
  await groupCardHeader.click();

  // 11. Verify that the "confirm join" modal opens instead of entering the group
  // It should prompt the user to join the group to view its materials
  const joinPromptMessage = page.locator('text=על מנת להיכנס לקבוצה ולראות את החומרים');
  await expect(joinPromptMessage).toBeVisible({ timeout: 5000 });

  // 12. Click "ביטול" (Cancel) inside the join prompt to dismiss it
  const cancelJoinBtn = page.locator('button:has-text("ביטול")');
  await expect(cancelJoinBtn).toBeVisible();
  await cancelJoinBtn.click();

  // Verify that the join prompt is now hidden and the user remains on the dashboard
  await expect(joinPromptMessage).not.toBeVisible();
  await expect(page.locator('h1', { hasText: groupName })).not.toBeVisible();
});
