import { test, expect } from '@playwright/test';

test('Send Chat Message - Success', async ({ page }) => {
  // 1. שלב ההכנה: התחברות
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'email@example.com' }).fill('test@gmail.com');
  await page.getByRole('textbox', { name: '••••••••' }).fill('1234');
  await page.getByRole('button', { name: 'Login' }).click();

// 2. כניסה לקבוצה (חכמה)
  const myGroup = page.getByRole('heading', { name: /קבוצת בדיקה E2E/ }).first();

  // נבדוק האם האלמנט בכלל קיים וגלוי במסך
  if (await myGroup.isVisible()) {
    // מצב 1: המשתמש כבר מחובר לקבוצה - פשוט ניכנס אליה
    await myGroup.click();
  } else {
    // מצב 2: המשתמש לא מחובר לאף קבוצה - נצטרף אליה קודם
    await page.getByRole('button', { name: 'הצטרף לקבוצה' }).first().click();
    
    // נאשר את חלונית ההצטרפות אם היא קופצת
    const confirmButton = page.getByRole('button', { name: 'אישור' });
    if (await confirmButton.isVisible()) {
        await confirmButton.click();
    }
    
    // נמתין מעט שהמערכת תרענן את רשימת "הקבוצות שלי", ואז ניכנס לקבוצה
    await page.waitForTimeout(1000);
    await page.getByRole('heading', { name: /קבוצת בדיקה E2E/ }).first().click();
  }

  // 3. יצירת הודעה ושליחה
  const uniqueMessage = `הודעת טסט אוטומטית: ${Date.now()}`;
  const chatInput = page.getByRole('textbox', { name: 'הקלד הודעה' });
  
  await chatInput.click();
  await chatInput.fill(uniqueMessage);
  
  // פתרון קסם עבור WebKit: לתת למערכת שבריר שנייה להבין שהטקסט הוזן לפני הלחיצה על אנטר
  await page.waitForTimeout(500);
  await chatInput.press('Enter');

  // 4. אימות התוצאה
  await expect(page.getByText(uniqueMessage)).toBeVisible();
});