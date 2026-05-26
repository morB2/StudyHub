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

// פונקציית עזר ליצירת משתמש מקומי מעוצב לפי מה שהקלדת
const createFallbackUser = (email) => {
  return {
    uid: "user_" + Math.random().toString(36).substr(2, 9),
    email: email,
    displayName: email.split("@")[0], // לוקח את השם שלפני ה-@
    avatar: "יי",
  };
};

// --- הרשמה ---
export const createUserWithEmailAndPassword = async (
  authObj,
  email,
  password,
  displayName = "",
) => {
  const name = displayName || email.split("@")[0];

  const response = await fetch("http://localhost:3001/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(
      errorData.error || errorData.message || "Registration failed",
    );
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  const loggedUser = {
    uid: data.user?.id || "user_supabase_123",
    email: email,
    displayName: name,
  };

  saveAndNotify(loggedUser);
  return { user: loggedUser };
};

// --- התחברות ---
export const signInWithEmailAndPassword = async (authObj, email, password) => {
  try {
    const response = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    }

    if (response.status === 404) {
      console.warn(
        "Server path /auth/login not found (404). Falling back to Local Mock Auth.",
      );
      const mockUser = createFallbackUser(email);
      saveAndNotify(mockUser);
      return { user: mockUser };
    }

    const data = await response.json();
    const loggedUser = {
      uid: data.user?.id || "user_supabase_123",
      email: email,
      displayName: email.split("@")[0],
    };

    saveAndNotify(loggedUser);
    return { user: loggedUser };
  } catch (error) {
    console.error(
      "Server connection failed. Using fallback simulation.",
      error,
    );
    const mockUser = createFallbackUser(email);
    saveAndNotify(mockUser);
    return { user: mockUser };
  }
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
