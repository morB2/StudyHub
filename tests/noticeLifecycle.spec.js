// @ts-check
import { test, expect } from '@playwright/test';

test('Notice lifecycle - Create, AI Improve, Publish, and Delete', async ({ page }) => {
  const timestamp = Date.now();
  const testEmail = `e2e_user_${timestamp}@example.com`;
  const testPassword = 'Password123';
  const groupName = `קבוצת מודעות E2E ${timestamp}`;
  const subjectName = `נושא מודעות ${timestamp}`;
  const description = `תיאור קבוצת מודעות מקצה לקצה`;
  
  const noticeTitle = `עדכון דחוף לגבי המבחן ${timestamp}`;
  const noticeContent = `שלום לכולם, נא לשים לב שהמפגש הבא שלנו מבוטל עקב החג הקרוב.`;

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

  // 4. Verify login and create a new group
  await expect(page.locator('button:has-text("התנתק")')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'יצירת קבוצה' }).click();
  await page.getByPlaceholder('לדוגמה: מבוא למדעי המחשב').fill(groupName);
  await page.getByPlaceholder('לדוגמה: מדמ"ח 101').fill(subjectName);
  await page.getByPlaceholder('בשביל מה הקבוצה? שתפו מטרות, זמני מפגשים וכו\'.').fill(description);
  await page.locator('button[type="submit"]:has-text("יצירת קבוצה")').click();

  // 5. Wait for the creation modal to close and confirm group loaded
  await expect(page.getByPlaceholder('לדוגמה: מבוא למדעי המחשב')).not.toBeVisible({ timeout: 5000 });
  
  // 6. Enter the newly created group (it should appear and be selectable or we might be entered immediately)
  // Let's search for it just like the first test to enter it
  const searchInput = page.getByPlaceholder('חיפוש לפי שם או מקצוע...');
  await searchInput.fill(groupName);
  const groupCardHeader = page.locator(`h3:has-text("${groupName}")`);
  await expect(groupCardHeader).toBeVisible({ timeout: 5000 });
  await groupCardHeader.click();
  await expect(page.locator('h1', { hasText: groupName })).toBeVisible({ timeout: 5000 });

  // 7. Click on the "Notice Board" (לוח מודעות) tab
  await page.locator('button:has-text("לוח מודעות")').click();

  // 8. Fill in the notice form
  await page.getByPlaceholder('לדוגמה: שינוי מיקום המפגש').fill(noticeTitle);
  await page.getByPlaceholder('כתוב את העדכון שלך עבור הקבוצה...').fill(noticeContent);

  // 9. Click on "AI Improve" (שפר באמצעות AI) button
  await page.locator('button[title="שפר באמצעות AI"]').click();

  // 10. Wait for the AI Suggestion box to be visible
  const aiSuggestionContainer = page.locator('text=הצעת ה-AI');
  await expect(aiSuggestionContainer).toBeVisible({ timeout: 15000 });

  // 11. Accept the AI suggestion (clicks "אישור" inside the suggestion box)
  // The first "אישור" button is the accept button of the suggestion
  await page.getByRole('button', { name: 'אישור' }).first().click();

  // 12. Submit the form to publish the notice (clicks "פרסם עדכון")
  await page.locator('button[type="submit"]:has-text("פרסם עדכון")').click();

  // 13. Verify the notice is published and visible on the notice board
  const publishedNoticeHeader = page.locator(`h4:has-text("${noticeTitle}")`);
  await expect(publishedNoticeHeader).toBeVisible({ timeout: 5000 });

  // 14. Click the delete icon of the published notice
  await page.locator('button[title="האם אתה בטוח שברצונך למחוק?"]').first().click();

  // 15. Confirm the deletion in the confirm modal (clicks "אישור" inside the confirm modal)
  // In the ConfirmModal, type is danger (bg-rose-600), we click the "אישור" button
  await page.locator('button:has-text("אישור")').last().click();

  // 16. Verify the notice is deleted and no longer visible on the notice board
  await expect(publishedNoticeHeader).not.toBeVisible({ timeout: 5000 });
});
