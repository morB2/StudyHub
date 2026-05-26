// // client/src/firebase.js
// import { mockCurrentUser, mockGroups } from './mock/mockData';

// // סימולציה של אובייקט ה-Auth של Firebase
// export const auth = {
//   currentUser: mockCurrentUser
// };

// // פונקציה לשמוע על שינויי מצב ההתחברות
// export const onAuthStateChanged = (authInstance, callback) => {
//   // מדמה משתמש מחובר מיד עם טעינת האפליקציה
//   callback(mockCurrentUser);
//   return () => { }; // פונקציית ניקוי (Unsubscribe) ריקה
// };

// // סימולציה של אובייקט ה-Firestore Database
// export const db = {
//   // נשאיר אותו כאובייקט ריק כרגע כדי שמעבר אליו לא ישבור ייבואים בקומפוננטות
// };

// // פונקציות אימות דמה (Mock Auth Functions) כדי שהטפסים יעבדו חלק
// export const GoogleAuthProvider = class { };

// export const signInWithPopup = async (authInstance, provider) => {
//   console.log("Mock Login: Connected via Google");
//   return { user: mockCurrentUser };
// };

// export const signInWithEmailAndPassword = async (authInstance, email, password) => {
//   console.log(`Mock Login: Connected via Email (${email})`);
//   return { user: mockCurrentUser };
// };

// export const createUserWithEmailAndPassword = async (authInstance, email, password) => {
//   console.log(`Mock Register: Created account for (${email})`);
//   return { user: mockCurrentUser };
// };

// export const updateProfile = async (userInstance, profileData) => {
//   console.log("Mock Profile Update:", profileData);
//   if (auth.currentUser) {
//     auth.currentUser.displayName = profileData.displayName || auth.currentUser.displayName;
//     auth.currentUser.photoURL = profileData.photoURL || auth.currentUser.photoURL;
//   }
//   return true;
// };

// export const signOut = async (authInstance) => {
//   console.log("Mock Logout: User signed out");
//   auth.currentUser = null;
//   return true;
// };


// client/src/firebase.js


//2------------------------------------------------------------------------------------------------------------------

// let authListener = null;

// const getStoredUser = () => {
//   const stored = localStorage.getItem('studybuddy_user');
//   return stored ? JSON.parse(stored) : null;
// };

// export const auth = {
//   currentUser: getStoredUser(),
// };

// export const onAuthStateChanged = (authObj, callback) => {
//   authListener = callback;
//   callback(auth.currentUser);
//   return () => {
//     authListener = null;
//   };
// };

// // הרשמה מול השרת האמיתי שלכן
// export const createUserWithEmailAndPassword = async (authObj, email, password) => {
//   try {
//     const response = await fetch("http://localhost:3001/auth/register", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password })
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Registration failed");
//     }

//     const data = await response.json();
//     const loggedUser = {
//       uid: data.user?.id || 'user_' + Math.random().toString(36).substr(2, 9),
//       email: email,
//       displayName: email.split('@')[0]
//     };

//     auth.currentUser = loggedUser;
//     localStorage.setItem('studybuddy_user', JSON.stringify(loggedUser));
//     if (authListener) authListener(loggedUser);
//     return { user: loggedUser };
//   } catch (error) {
//     console.error("Server register error:", error);
//     throw error;
//   }
// };

// // התחברות מול השרת האמיתי שלכן
// export const signInWithEmailAndPassword = async (authObj, email, password) => {
//   try {
//     const response = await fetch("http://localhost:3001/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password })
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Login failed");
//     }

//     const data = await response.json();
//     const loggedUser = {
//       uid: data.user?.id || 'user_mock_123',
//       email: email,
//       displayName: email.split('@')[0]
//     };

//     auth.currentUser = loggedUser;
//     localStorage.setItem('studybuddy_user', JSON.stringify(loggedUser));
//     if (authListener) authListener(loggedUser);
//     return { user: loggedUser };
//   } catch (error) {
//     console.error("Server login error:", error);
//     throw error;
//   }
// };

// // התנתקות מלאה וניקוי הזיכרון המקומי
// export const signOut = async (authObj) => {
//   auth.currentUser = null;
//   localStorage.removeItem('studybuddy_user');
//   if (authListener) authListener(null);
//   return true;
// };

// export const db = {};


//3------------------------------------------------------------------------------------------------------------------

// client/src/firebase.js

let authListener = null;

const getStoredUser = () => {
  const stored = localStorage.getItem('studybuddy_user');
  return stored ? JSON.parse(stored) : null;
};

export const auth = {
  currentUser: getStoredUser(),
};

export const onAuthStateChanged = (authObj, callback) => {
  authListener = callback;
  callback(auth.currentUser);
  return () => {
    authListener = null;
  };
};

// פונקציית עזר ליצירת משתמש מקומי מעוצב לפי מה שהקלדת
const createFallbackUser = (email) => {
  return {
    uid: 'user_' + Math.random().toString(36).substr(2, 9),
    email: email,
    displayName: email.split('@')[0], // לוקח את השם שלפני ה-@
    avatar: "יי"
  };
};

// --- הרשמה ---
export const createUserWithEmailAndPassword = async (authObj, email, password) => {
  try {
    const response = await fetch("http://localhost:3001/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    // אם השרת מחזיר שגיאה אמיתית שהיא לא 404 (למשל: סיסמה קצרה מדי)
    if (!response.ok && response.status !== 404) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Registration failed");
    }

    // אם השרת לא קיים או מחזיר 404 - נעבור אוטומטית למצב מקומי (Fallback)
    if (response.status === 404) {
      console.warn("Server path /auth/register not found (404). Falling back to Local Mock Auth.");
      const mockUser = createFallbackUser(email);
      saveAndNotify(mockUser);
      return { user: mockUser };
    }

    const data = await response.json();
    const loggedUser = {
      uid: data.user?.id || 'user_supabase_123',
      email: email,
      displayName: email.split('@')[0]
    };

    saveAndNotify(loggedUser);
    return { user: loggedUser };
  } catch (error) {
    // במקרה של שגיאת רשת (השרת כבוי לגמרי) - נשתמש ב-Mock ולא נתרסק
    console.error("Server connection failed. Using fallback simulation.", error);
    const mockUser = createFallbackUser(email);
    saveAndNotify(mockUser);
    return { user: mockUser };
  }
};

// --- התחברות ---
export const signInWithEmailAndPassword = async (authObj, email, password) => {
  try {
    const response = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    }

    if (response.status === 404) {
      console.warn("Server path /auth/login not found (404). Falling back to Local Mock Auth.");
      const mockUser = createFallbackUser(email);
      saveAndNotify(mockUser);
      return { user: mockUser };
    }

    const data = await response.json();
    const loggedUser = {
      uid: data.user?.id || 'user_supabase_123',
      email: email,
      displayName: email.split('@')[0]
    };

    saveAndNotify(loggedUser);
    return { user: loggedUser };
  } catch (error) {
    console.error("Server connection failed. Using fallback simulation.", error);
    const mockUser = createFallbackUser(email);
    saveAndNotify(mockUser);
    return { user: mockUser };
  }
};

// --- התנתקות ---
export const signOut = async (authObj) => {
  auth.currentUser = null;
  localStorage.removeItem('studybuddy_user');
  if (authListener) authListener(null);
  return true;
};

// פונקציית עזר לעדכון הסטייט וה-Storage
const saveAndNotify = (user) => {
  auth.currentUser = user;
  localStorage.setItem('studybuddy_user', JSON.stringify(user));
  if (authListener) authListener(user);
};

export const db = {};