# StudyHub

מדריך קצר להרצת הפרויקט המקומי

דרישות מקדימות:

- Node.js (מומלץ v18+)
- npm (מגיע עם Node)

# StudyHub

תיעוד קצר וממוקד להרצת הפרויקט המקומי ותיאור ה-client.

דרישות מקדימות

- `Node.js` (מומלץ v18+)
- `npm` (מגיע עם Node)

הרצת הפרויקט בסביבת פיתוח

1. שרת (backend)

```bash
cd server
npm install
# להרצה פשוטה (או להוספת סקריפט `start`):
node index.js
# או (לאחר הוספת "start": "node index.js" ב- package.json):
npm start
```

השרת מאזין ברירת מחדל על: http://localhost:3001

2. לקוח (frontend) – Vite + React

```bash
cd client
npm install
npm run dev
```

ה-Dev server של Vite יופיע בדרך כלל על: http://localhost:5173

בניית הלקוח לפרודקשן

```bash
cd client
npm run build
npm run preview
```

הערות חשובות על ה-client

- ה-client בנוי עם React + Vite וכולל Tailwind CSS.
- הפרויקט משתמש ב-mock של Firebase (קובץ `client/src/firebase.js`) — אין חיבור אמיתי ל-Firebase; כל פונקציות האימות/DB מדומות לצורך פיתוח מקומי.
- נתוני הדמו נמצאים ב-`client/src/mock/mockData.js` ומשמשים להפעלת רכיבים בזמן פיתוח.

תכונות מרכזיות ב-client

- מערכת משתמשים מדומה (login/register) ו-`Auth` UI.
- יצירת וניהול קבוצות לימוד (`CreateGroup`, `GroupList`, `GroupDetail`).
- גלריית חומרי לימוד ושיתוף קבצים (מדומה) — `mockMaterials`.
- צ'אט/הודעות וקירות הודעות (mock data).
- עוזר AI סימולטיבי (`AIAssistant`) שנותן תשובות מבוססות על התכנים בקבוצה.
- מנהל התראות (Toasts) — `NotificationManager`.
- מודאלים נוספים: `AuthModal`, `ProfileModal`, `Settings`, `InvitationsList`.
- רכיב וידאו/שיחות (UI בלבד) — `VideoCall` (סימולציה / ממשק בלבד).

קבצים חשובים בספריית הלקוח

- `client/src/App.jsx` — כניסה מרכזית לאפליקציה וניווט בין תצוגות.
- `client/src/firebase.js` — סימולציית Firebase (auth/db וכו').
- `client/src/mock/mockData.js` — נתוני דמו: משתמשים, קבוצות, הודעות.
- `client/src/components/` — קומפוננטות ה-UI (AIAssistant, CreateGroup, GroupList, GroupDetail ועוד).

פיתוח מקומי וטיפים

- אין צורך להגדיר משתני סביבה עבור Firebase — המערכת משתמשת במחלקות ופונקציות mock.
- לשילוב עם שירות אמיתי (כדאי רק לשלב אחר בדיקה): עדכן את `client/src/firebase.js` כדי לייבא ולהגדיר את Firebase האמיתי ו-`db`/`auth`.
- לשינוי שפה/כיווניות יש Context בשם `LanguageContext` (`client/src/contexts/LanguageContext.jsx`).

בעיות נפוצות

- אם דפדפן לא טוען את ה-client: ודא שהפעלת `npm install` בתיקיית `client` והרצת `npm run dev`.
- אם ה-API לא זמין: ודא שהשרת פועל על פורט 3001.

מפת דרכים / מה לבחון ראשון

1. הרץ את ה-client (`npm run dev`) והסר שמקור הנתונים הוא `mock` — בדוק רכיבים כמו `GroupList` ו-`GroupDetail`.
2. בדוק את ה-AIAssistant כדי לראות שהוא מגיב לשאילתות מבוססות Mock.
3. אם תרצה חיבור אמיתי ל-backend/Firebase, אשמח להנחות אותך כיצד לשלב ולבדוק את הממשק.

אם תרצה, אוכל להוסיף סקריפט `start` ל-`server/package.json` ולעזור לחבר Firebase אמיתי.
