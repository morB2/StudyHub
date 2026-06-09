// client/src/components/Auth.jsx

import { useState, useEffect } from "react";
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "../firebase";
import { LogIn, LogOut, Mail, Lock, X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Auth({ onClose, mode = "all" }) {
  const { isRTL } = useLanguage();
  const [user, setUser] = useState(auth.currentUser);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    // 1. חסימת סיסמה קצרה מדי בצד הלקוח (המשתמש מקבל שגיאה אדומה מיד)
    if (isSignUp && password.length < 4) {
      setError("הסיסמה חייבת להכיל לפחות 4 תווים.");
      return; // עוצרים את הפעולה, לא פונים לשרת
    }

    try {
      if (isSignUp) {
        const defaultName = email.split("@")[0];
        
        const response = await fetch("http://localhost:3001/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: defaultName, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "ההרשמה נכשלה.");
        }

        // במקום alert: נציג הודעה ונחכה רגע לפני שנעבור למצב התחברות
        setError("הרשמה בוצעה בהצלחה! מעביר אותך להתחברות...");
        
        setTimeout(() => {
          setIsSignUp(false);
          setPassword("");
          setError(""); // איפוס ההודעה אחרי המעבר
        }, 2000); // ההודעה תוצג למשך 2 שניות
        
        
      } else {
        // ======== התחברות אמיתית מול שרת ה-Node.js ========
        const response = await fetch("http://localhost:3001/users/login", { 
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "ההתחברות נכשלה. כדאי לבדוק את הפרטים שוב.");
        }

        auth.currentUser = data.user;
        localStorage.setItem("studybuddy_user", JSON.stringify(data.user));
        localStorage.setItem("studybuddy_token", data.token); 

        if (onClose) onClose();
      window.location.reload();
}
    } catch (err) {
      setError(err.message || "Authentication failed.");
    }
  };

  const handleGoogleSignIn = () => {
    const width = 500,
      height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const googleWindow = window.open(
      "https://accounts.google.com/gsi/select?client_id=mock&ux_mode=popup",
      "Google Sign In",
      `width=${width},height=${height},top=${top},left=${left}`,
    );

    const timer = setInterval(() => {
      if (googleWindow ? googleWindow.closed : true) {
        clearInterval(timer);

        const userEmail =
          prompt("הכניסי את כתובת הג'ימייל איתה בחרת להתחבר:") ||
          "user@gmail.com";
        const googleUser = {
          uid: "google_" + Math.random().toString(36).substr(2, 9),
          email: userEmail,
          displayName: userEmail.split("@")[0],
          avatar: userEmail.substring(0, 2).toUpperCase(),
        };

        auth.currentUser = googleUser;
        localStorage.setItem("studybuddy_user", JSON.stringify(googleUser));
        window.location.reload();
      }
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      // 1. מחיקת נתוני המשתמש והטוקן מה-Local Storage כדי שהדפדפן ישכח אותם
      localStorage.removeItem("studybuddy_user");
      localStorage.removeItem("studybuddy_token");

      // 2. איפוס אובייקט המשתמש המקומי בזיכרון של ה-Auth
      if (auth) {
        auth.currentUser = null;
      }

      // 3. רענון העמוד - עכשיו האפליקציה תעלה מחדש, תראה שה-Local Storage ריק ותחזיר לעמוד הנחיתה
    window.location.reload();
} catch (err) {
      console.error("Logout error:", err);
    }
  };

  // מניעת כפל ויזואלי: אם אנחנו בתוך עמוד הנחיתה כמודאל, לא נרנדר את כפתור הפרופיל הראשי
  if (user && mode === "navbarOnly") {
    return (
      <div className="flex items-center gap-3 bg-gray-50/80 px-4 py-2 rounded-2xl border border-gray-100">
        <div className={isRTL ? "text-right" : "text-left"}>
          <p className="text-xs font-bold text-gray-900">{user.displayName}</p>
          <button
            onClick={handleLogout}
            className="text-[11px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer mt-0.5"
          >
            <LogOut size={12} />
            <span>התנתק</span>
          </button>
        </div>
        <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
          {user.avatar ||
            (user.displayName ? user.displayName.substring(0, 2) : "יי")}
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl relative border border-gray-50 text-left">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
      >
        <X size={20} />
      </button>

      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900">
          {isSignUp ? "Register" : "Login"}
        </h2>

        {error && (
          <div className={`p-3 text-xs font-semibold rounded-xl text-center border ${error.includes("בהצלחה") ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="email"
                required
                placeholder="email@example.com"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="password"
                required
minLength={4} 
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <LogIn size={16} />
            <span>{isSignUp ? "Register" : "Login"}</span>
          </button>
        </form>

        <div className="relative flex items-center justify-center py-2">
          <div className="absolute w-full border-t border-gray-100"></div>
          <span className="relative bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-4 h-4"
          />
          <span>Sign in with Google</span>
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-xs text-gray-500"
          >
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <span className="text-indigo-600 font-bold hover:underline">
              {isSignUp ? "Login" : "Register"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
