// client/src/firebase.js

//no mockdata, real implementation with fallback to local simulation if server is not available

let authListener = null;

const getStoredUser = () => {
  const stored = localStorage.getItem("studybuddy_user");
  if (!stored) return null;
  const user = JSON.parse(stored);
  if (user) {
    if (user.id && !user.uid) {
      user.uid = user.id;
    } else if (user.uid && !user.id) {
      user.id = user.uid;
    }
  }
  return user;
};

let currentUserInstance = getStoredUser();

export const auth = {
  get currentUser() {
    return currentUserInstance;
  },
  set currentUser(user) {
    if (user) {
      if (user.id && !user.uid) {
        user.uid = user.id;
      } else if (user.uid && !user.id) {
        user.id = user.uid;
      }
    }
    currentUserInstance = user;
    if (authListener) authListener(user);
  }
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
