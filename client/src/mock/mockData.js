// client/src/mock/mockData.js

// רשימת קבוצות לימוד לדוגמה (נצרך עבור רכיב ההזמנות שטרם חובר לשרת)
export const mockGroups = [
  {
    id: "group_1",
    name: "מבוא למדעי המחשב - סמסטר א'",
    subject: "מדעי המחשב",
    description: "קבוצת תרגול והכנה למבחן המסכם במבוא למדעי המחשב. עוברים על מבני נתונים, רקורסיות ויעילות.",
    creatorId: "user_vsc_123",
    members: ["user_vsc_123", "user_456", "user_789"],
    isPrivate: false,
    createdAt: new Date(1715000000 * 1000)
  },
  {
    id: "group_2",
    name: "אינפי 1 - מרתון של שאלות ותשובות",
    subject: "מתמטיקה",
    description: "קבוצה פומבית לפתרון תרגילי בית קשים באינפי 1. כל אחד מוזמן להעלות חומרים.",
    creatorId: "user_456",
    members: ["user_456", "user_789"],
    isPrivate: false,
    createdAt: new Date(1715100000 * 1000)
  },
  {
    id: "group_3",
    name: "פיתוח אפליקציות ב-React & Node.js",
    subject: "פיתוח תוכנה",
    description: "קבוצה פרטית של פרויקט הגמר. נא לא לבקש להצטרף אם אתם לא בצוות.",
    creatorId: "user_789",
    members: ["user_vsc_123", "user_789"],
    isPrivate: true,
    createdAt: new Date(1715200000 * 1000)
  }
];

// הזמנות לדוגמה לקבוצות פרטיות (נצרך עבור רכיב ההזמנות שטרם חובר לשרת)
export const mockInvitations = [
  {
    id: "invite_1",
    groupId: "group_3",
    groupName: "פיתוח אפליקציות ב-React & Node.js",
    inviterId: "user_789",
    inviterName: "יוסי לוי",
    inviteeEmail: "israel@example.com",
    status: "pending",
    createdAt: new Date(1715210000 * 1000)
  }
];