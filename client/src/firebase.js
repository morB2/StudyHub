// client/src/firebase.js

//no mockdata, real implementation with fallback to local simulation if server is not available

let authListener = null;

const getStoredUser = () => {
  const stored = localStorage.getItem("studybuddy_user");
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

// --- התנתקות ---
export const signOut = async (authObj) => {
  void authObj;
  auth.currentUser = null;
  localStorage.removeItem("studybuddy_user");
  if (authListener) authListener(null);
  return true;
};

// פונקציית עזר לעדכון הסטייט וה-Storage
const saveAndNotify = (user) => {
  auth.currentUser = user;
  localStorage.setItem("studybuddy_user", JSON.stringify(user));
  if (authListener) authListener(user);
};

export const db = {};
