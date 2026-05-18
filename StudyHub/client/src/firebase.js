// client/src/firebase.js
import { mockCurrentUser, mockGroups } from './mock/mockData';

// סימולציה של אובייקט ה-Auth של Firebase
export const auth = {
  currentUser: mockCurrentUser
};

// פונקציה לשמוע על שינויי מצב ההתחברות
export const onAuthStateChanged = (authInstance, callback) => {
  // מדמה משתמש מחובר מיד עם טעינת האפליקציה
  callback(mockCurrentUser);
  return () => { }; // פונקציית ניקוי (Unsubscribe) ריקה
};

// סימולציה של אובייקט ה-Firestore Database
export const db = {
  // נשאיר אותו כאובייקט ריק כרגע כדי שמעבר אליו לא ישבור ייבואים בקומפוננטות
};

// פונקציות אימות דמה (Mock Auth Functions) כדי שהטפסים יעבדו חלק
export const GoogleAuthProvider = class { };

export const signInWithPopup = async (authInstance, provider) => {
  console.log("Mock Login: Connected via Google");
  return { user: mockCurrentUser };
};

export const signInWithEmailAndPassword = async (authInstance, email, password) => {
  console.log(`Mock Login: Connected via Email (${email})`);
  return { user: mockCurrentUser };
};

export const createUserWithEmailAndPassword = async (authInstance, email, password) => {
  console.log(`Mock Register: Created account for (${email})`);
  return { user: mockCurrentUser };
};

export const updateProfile = async (userInstance, profileData) => {
  console.log("Mock Profile Update:", profileData);
  if (auth.currentUser) {
    auth.currentUser.displayName = profileData.displayName || auth.currentUser.displayName;
    auth.currentUser.photoURL = profileData.photoURL || auth.currentUser.photoURL;
  }
  return true;
};

export const signOut = async (authInstance) => {
  console.log("Mock Logout: User signed out");
  auth.currentUser = null;
  return true;
};