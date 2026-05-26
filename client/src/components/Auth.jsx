// // client/src/components/Auth.jsx
// import React, { useState, useEffect } from 'react';
// import { auth, signOut, onAuthStateChanged } from '../firebase';
// import { LogIn, LogOut, User as UserIcon, Settings } from 'lucide-react';
// import AuthModal from './AuthModal';
// import ProfileModal from './ProfileModal';
// import { useLanguage } from '../contexts/LanguageContext';

// export default function Auth() {
//   const { t } = useLanguage();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [showProfileModal, setShowProfileModal] = useState(false);

//   // האזנה לשינויי מצב המשתמש המדומה או האמיתי ב-Auth המקומי
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
//       setUser(firebaseUser);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       console.log("Mock User Logged Out");
//     } catch (error) {
//       console.error('Error signing out:', error);
//     }
//   };

//   if (loading) {
//     return <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />;
//   }

//   return (
//     <div className="flex items-center gap-4">
//       {user ? (
//         <div className="flex items-center gap-4 animate-fade-in">
//           <div className="hidden md:flex flex-col items-end text-right">
//             <span className="text-sm font-bold text-gray-900">
//               {user.displayName || 'Anonymous'}
//             </span>
//             <div className="flex items-center gap-2 mt-0.5">
//               <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
//                 Student
//               </span>
//               <button
//                 onClick={handleLogout}
//                 className="text-[10px] font-bold text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors uppercase tracking-wider cursor-pointer"
//               >
//                 <LogOut size={10} /> {t('logout')}
//               </button>
//             </div>
//           </div>
          
//           {/* Avatar Button to open profile */}
//           <button 
//             onClick={() => setShowProfileModal(true)}
//             className="relative group cursor-pointer outline-none"
//           >
//             {user.photoURL ? (
//               <img 
//                 src={user.photoURL} 
//                 alt={user.displayName || ''} 
//                 className="w-10 h-10 rounded-full border border-gray-200 shadow-sm group-hover:scale-105 transition-transform" 
//                 referrerPolicy="no-referrer" 
//               />
//             ) : (
//               <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform text-indigo-400">
//                 <UserIcon size={20} />
//               </div>
//             )}
//           </button>
//         </div>
//       ) : (
//         <button
//           onClick={() => setShowAuthModal(true)}
//           className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-bold text-sm cursor-pointer"
//         >
//           <LogIn size={18} />
//           {t('signIn')}
//         </button>
//       )}

//       {/* Auth Modal Selection */}
//       {showAuthModal && (
//         <AuthModal onClose={() => setShowAuthModal(false)} />
//       )}

//       {/* Profile Editing Modal */}
//       {showProfileModal && (
//         <ProfileModal onClose={() => setShowProfileModal(false)} />
//       )}
//     </div>
//   );
// }

// client/src/components/Auth.jsx



//1------------------------------------------------------------------------------------------------------------------

// import React, { useState, useEffect } from 'react';
// import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from '../firebase';
// import { LogIn, LogOut, Mail, Lock, X } from 'lucide-react';
// import { useLanguage } from '../contexts/LanguageContext';

// export default function Auth({ onClose }) {
//   const { t, isRTL } = useLanguage();
//   const [user, setUser] = useState(auth.currentUser);
  
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleAuth = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       if (isSignUp) {
//         await createUserWithEmailAndPassword(auth, email, password);
//       } else {
//         await signInWithEmailAndPassword(auth, email, password);
//       }
//     } catch (err) {
//       setError(err.message || 'Authentication failed. Please check your connection.');
//     }
//   };

//   const handleLogout = async () => {
//     await signOut(auth);
//   };

//   // מצב מחובר: מציגים רק את פרופיל המשתמש וכפתור "התנתק" ב-Navbar
//   if (user) {
//     return (
//       <div className="flex items-center gap-3 bg-gray-50/80 px-4 py-2 rounded-2xl border border-gray-100">
//         <div className={isRTL ? 'text-right' : 'text-left'}>
//           <p className="text-xs font-bold text-gray-900">{user.displayName || 'ישראל ישראלי'}</p>
//           <button 
//             onClick={handleLogout}
//             className="text-[11px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
//           >
//             <LogOut size={12} />
//             <span>התנתק</span>
//           </button>
//         </div>
//         <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
//           {user.displayName ? user.displayName.substring(0, 2) : 'יי'}
//         </div>
//       </div>
//     );
//   }

//   // מצב מנותק: המודאל המקורי של חלונית ה-Login/Register (פופ-אפ)
//   return (
//     <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl relative border border-gray-50 text-left">
//       {/* כפתור סגירה X */}
//       <button 
//         onClick={onClose} 
//         className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
//       >
//         <X size={20} />
//       </button>

//       <div className="space-y-6">
//         <h2 className="text-2xl font-black text-gray-900">
//           {isSignUp ? 'Register' : 'Login'}
//         </h2>

//         {error && (
//           <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl text-center border border-red-100">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleAuth} className="space-y-4">
//           {/* שדה אימייל */}
//           <div className="space-y-1.5">
//             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</label>
//             <div className="relative">
//               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//               <input
//                 type="email"
//                 required
//                 placeholder="email@example.com"
//                 className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* שדה סיסמה */}
//           <div className="space-y-1.5">
//             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
//             <div className="relative">
//               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//               <input
//                 type="password"
//                 required
//                 placeholder="••••••••"
//                 className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* כפתור שליחה מרכזי סגול */}
//           <button
//             type="submit"
//             className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
//           >
//             <LogIn size={16} />
//             <span>{isSignUp ? 'Register' : 'Login'}</span>
//           </button>
//         </form>

//         {/* קו מפריד */}
//         <div className="relative flex items-center justify-center py-2">
//           <div className="absolute w-full border-t border-gray-100"></div>
//           <span className="relative bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
//             Or continue with
//           </span>
//         </div>

//         {/* כפתור התחברות עם גוגל (מדמה כניסה מהירה ומפעיל את הסטייט) */}
//         <button
//           type="button"
//           onClick={() => {
//             const googleUser = { uid: 'google_123', email: 'google@user.com', displayName: 'ישראל ישראלי' };
//             localStorage.setItem('studybuddy_user', JSON.stringify(googleUser));
//             window.location.reload();
//           }}
//           className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
//         >
//           <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
//           <span>Sign in with Google</span>
//         </button>

//         {/* החלפה בין הרשמה להתחברות */}
//         <div className="text-center pt-2">
//           <button
//             type="button"
//             onClick={() => {
//               setIsSignUp(!isSignUp);
//               setError('');
//             }}
//             className="text-xs text-gray-500"
//           >
//             {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
//             <span className="text-indigo-600 font-bold hover:underline">
//               {isSignUp ? 'Login' : 'Register'}
//             </span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


//2------------------------------------------------------------------------------------------------------------------

// client/src/components/Auth.jsx
// import React, { useState, useEffect } from 'react';
// import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from '../firebase';
// import { LogIn, LogOut, Mail, Lock, X } from 'lucide-react';
// import { useLanguage } from '../contexts/LanguageContext';

// export default function Auth({ onClose }) {
//   const { t, isRTL } = useLanguage();
//   const [user, setUser] = useState(auth.currentUser);
  
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });
//     return () => unsubscribe();
//   }, []);

//   // התחברות עם אימייל וסיסמה (מול השרת / פולבק מוק)
//   const handleAuth = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       if (isSignUp) {
//         await createUserWithEmailAndPassword(auth, email, password);
//       } else {
//         await signInWithEmailAndPassword(auth, email, password);
//       }
//       if (onClose) onClose();
//     } catch (err) {
//       setError(err.message || 'Authentication failed.');
//     }
//   };

//   // התחברות גוגל עם חלון בחירה אמיתי לחלוטין
//   const handleGoogleSignIn = () => {
//     const width = 500, height = 600;
//     const left = window.screen.width / 2 - width / 2;
//     const top = window.screen.height / 2 - height / 2;
    
//     // פתיחת חלון אימות חשבונות גוגל רשמי
//     const googleWindow = window.open(
//       "https://accounts.google.com/gsi/select?client_id=mock&ux_mode=popup",
//       "Google Sign In",
//       `width=${width},height=${height},top=${top},left=${left}`
//     );

//     // סימולציית קבלת החשבון הנבחר על ידי המשתמש מתוך החלון
//     const timer = setInterval(() => {
//       if (googleWindow ? googleWindow.closed : true) {
//         clearInterval(timer);
        
//         // יצירת המשתמש על פי הבחירה הפיקטיבית אך עם אימייל דינמי שאת קובעת או ברירת מחדל של המחשב
//         const userEmail = prompt("הכניסי את כתובת הג'ימייל איתה בחרת להתחבר:") || "user@gmail.com";
//         const googleUser = { 
//           uid: 'google_' + Math.random().toString(36).substr(2, 9), 
//           email: userEmail, 
//           displayName: userEmail.split('@')[0],
//           avatar: userEmail.substring(0, 2).toUpperCase()
//         };
        
//         auth.currentUser = googleUser;
//         localStorage.setItem('studybuddy_user', JSON.stringify(googleUser));
//         window.location.reload();
//       }
//     }, 1000);
//   };

//   const handleLogout = async () => {
//     await signOut(auth);
//   };

//   // מצב מחובר: מציגים את פרטי המשתמש המחובר כעת ב-Navbar
//   if (user) {
//     return (
//       <div className="flex items-center gap-3 bg-gray-50/80 px-4 py-2 rounded-2xl border border-gray-100">
//         <div className={isRTL ? 'text-right' : 'text-left'}>
//           <p className="text-xs font-bold text-gray-900">{user.displayName}</p>
//           <button 
//             onClick={handleLogout}
//             className="text-[11px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
//           >
//             <LogOut size={12} />
//             <span>התנתק</span>
//           </button>
//         </div>
//         <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
//           {user.avatar || (user.displayName ? user.displayName.substring(0, 2) : 'יי')}
//         </div>
//       </div>
//     );
//   }

//   // מצב מנותק: מודאל הלוגין המקורי
//   return (
//     <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl relative border border-gray-50 text-left">
//       <button 
//         onClick={onClose} 
//         className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
//       >
//         <X size={20} />
//       </button>

//       <div className="space-y-6">
//         <h2 className="text-2xl font-black text-gray-900">
//           {isSignUp ? 'Register' : 'Login'}
//         </h2>

//         {error && (
//           <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl text-center border border-red-100">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleAuth} className="space-y-4">
//           <div className="space-y-1.5">
//             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</label>
//             <div className="relative">
//               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//               <input
//                 type="email"
//                 required
//                 placeholder="email@example.com"
//                 className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//           </div>

//           <div className="space-y-1.5">
//             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
//             <div className="relative">
//               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//               <input
//                 type="password"
//                 required
//                 placeholder="••••••••"
//                 className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//           </div>

//           <button
//             type="submit"
//             className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
//           >
//             <LogIn size={16} />
//             <span>{isSignUp ? 'Register' : 'Login'}</span>
//           </button>
//         </form>

//         <div className="relative flex items-center justify-center py-2">
//           <div className="absolute w-full border-t border-gray-100"></div>
//           <span className="relative bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
//             Or continue with
//           </span>
//         </div>

//         <button
//           type="button"
//           onClick={handleGoogleSignIn}
//           className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
//         >
//           <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
//           <span>Sign in with Google</span>
//         </button>

//         <div className="text-center pt-2">
//           <button
//             type="button"
//             onClick={() => {
//               setIsSignUp(!isSignUp);
//               setError('');
//             }}
//             className="text-xs text-gray-500"
//           >
//             {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
//             <span className="text-indigo-600 font-bold hover:underline">
//               {isSignUp ? 'Login' : 'Register'}
//             </span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


//3------------------------------------------------------------------------------------------------------------------

// client/src/components/Auth.jsx
import React, { useState, useEffect } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from '../firebase';
import { LogIn, LogOut, Mail, Lock, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Auth({ onClose, mode = "all" }) {
  const { t, isRTL } = useLanguage();
  const [user, setUser] = useState(auth.currentUser);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (onClose) onClose();
      // רענון קל כדי לעדכן את האפליקציה הראשית והדשבורד מיד
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    }
  };

  const handleGoogleSignIn = () => {
    const width = 500, height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const googleWindow = window.open(
      "https://accounts.google.com/gsi/select?client_id=mock&ux_mode=popup",
      "Google Sign In",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    const timer = setInterval(() => {
      if (googleWindow ? googleWindow.closed : true) {
        clearInterval(timer);
        
        const userEmail = prompt("הכניסי את כתובת הג'ימייל איתה בחרת להתחבר:") || "user@gmail.com";
        const googleUser = { 
          uid: 'google_' + Math.random().toString(36).substr(2, 9), 
          email: userEmail, 
          displayName: userEmail.split('@')[0],
          avatar: userEmail.substring(0, 2).toUpperCase()
        };
        
        auth.currentUser = googleUser;
        localStorage.setItem('studybuddy_user', JSON.stringify(googleUser));
        window.location.reload();
      }
    }, 1000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  // מניעת כפל ויזואלי: אם אנחנו בתוך עמוד הנחיתה כמודאל, לא נרנדר את כפתור הפרופיל הראשי
  if (user && mode === "navbarOnly") {
    return (
      <div className="flex items-center gap-3 bg-gray-50/80 px-4 py-2 rounded-2xl border border-gray-100">
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <p className="text-xs font-bold text-gray-900">{user.displayName}</p>
          <button 
            onClick={handleLogout}
            className="text-[11px] text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <LogOut size={12} />
            <span>התנתק</span>
          </button>
        </div>
        <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
          {user.avatar || (user.displayName ? user.displayName.substring(0, 2) : 'יי')}
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
          {isSignUp ? 'Register' : 'Login'}
        </h2>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
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
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="password"
                required
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
            <span>{isSignUp ? 'Register' : 'Login'}</span>
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
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
          <span>Sign in with Google</span>
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs text-gray-500"
          >
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <span className="text-indigo-600 font-bold hover:underline">
              {isSignUp ? 'Login' : 'Register'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}