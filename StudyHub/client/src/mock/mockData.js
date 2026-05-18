// client/src/mockData.js

// משתמש דמה מחובר כרגע
export const mockCurrentUser = {
  uid: "user_vsc_123",
  displayName: "ישראל ישראלי",
  email: "israel@example.com",
  photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
  bio: "סטודנט למדעי המחשב, אוהב ללמוד בקבוצות!",
  institution: "האוניברסיטה הפתוחה",
  followedGroups: ["group_1", "group_3"],
  notificationSettings: {
    chat: true,
    meetings: true
  },
  language: "he"
};

// רשימת קבוצות לימוד לדוגמה
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

// הודעות צ'אט לדוגמה עבור קבוצה 1
export const mockChatMessages = [
  {
    id: "msg_1",
    groupId: "group_1",
    senderId: "user_456",
    senderName: "דנה כהן",
    text: "היי לכולם! מישהו הצליח לפתור את שאלה 3 בדף התרגול של הרקורסיות?",
    type: "text",
    createdAt: new Date(1715010000 * 1000)
  },
  {
    id: "msg_2",
    groupId: "group_1",
    senderId: "user_vsc_123",
    senderName: "ישראל ישראלי",
    text: "כן, שלחתי את הפתרון בתיקיית החומרים, תציצי שם זה ממש פשוט ברגע שמבינים את תנאי העצירה.",
    type: "text",
    createdAt: new Date(1715010500 * 1000)
  }
];

// חומרי לימוד (קבצים/תיקיות) לדוגמה
export const mockMaterials = [
  {
    id: "mat_1",
    groupId: "group_1",
    uploaderId: "user_vsc_123",
    fileName: "סיכום_הרצאות_מבני_נתונים.pdf",
    fileUrl: "https://example.com/files/summary.pdf",
    fileType: "application/pdf",
    folderId: null,
    createdAt: new Date(1715005000 * 1000)
  }
];

// פגישות/מפגשים מתוכננים לדוגמה
export const mockMeetings = [
  {
    id: "meet_1",
    groupId: "group_1",
    title: "מרתון פתרון מבחנים משנים קודמות",
    description: "נפגשים בזום/וידאו לעבור על מבחן משנת 2024",
    startTime: new Date(1747681200 * 1000), // תאריך עתידי בשנת 2025/2026
    location: "מפגש וידאו באתר",
    creatorId: "user_vsc_123",
    createdAt: new Date(1715006000 * 1000)
  }
];

// לוח מודעות לדוגמה
export const mockNotices = [
  {
    id: "notice_1",
    groupId: "group_1",
    authorId: "user_vsc_123",
    authorName: "ישראל ישראלי",
    title: "שינוי מועד המפגש הקרוב",
    content: "שימו לב חברים, המפגש של יום חמישי נדחה בשעה אחת. נתחיל ב-19:00 במקום ב-18:00.",
    createdAt: new Date(1715008000 * 1000)
  }
];

// הזמנות לדוגמה לקבוצות פרטיות
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

// תיקיות חומרים לדוגמה
export const mockFolders = [
  {
    id: "folder_1",
    groupId: "group_1",
    name: "הרצאות",
    parentId: null,
    creatorId: "user_vsc_123",
    createdAt: new Date(1715003000 * 1000)
  },
  {
    id: "folder_2",
    groupId: "group_1",
    name: "תרגילים",
    parentId: null,
    creatorId: "user_456",
    createdAt: new Date(1715004000 * 1000)
  }
];

// משתמשים לדוגמה
export const mockUsers = [
  {
    uid: "user_vsc_123",
    displayName: "ישראל ישראלי",
    email: "israel@example.com",
    photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "סטודנט למדעי המחשב",
    institution: "האוניברסיטה הפתוחה"
  },
  {
    uid: "user_456",
    displayName: "דנה כהן",
    email: "dana@example.com",
    photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "סטודנטית למתמטיקה",
    institution: "אוניברסיטת תל אביב"
  },
  {
    uid: "user_789",
    displayName: "יוסי לוי",
    email: "yossi@example.com",
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "מפתח ודס",
    institution: "בר אילן"
  }
];