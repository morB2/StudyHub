// client/src/components/LandingPage.jsx
import React, { useState } from 'react';
import Auth from './Auth';
import { GraduationCap, BookOpen, Users, Calendar } from 'lucide-react';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col justify-between animate-fade-in">
      {/* סרגל ניווט עליון של דף הנחיתה */}
      <header className="px-6 sm:px-12 h-20 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
            <GraduationCap size={22} />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">StudyHub</span>
        </div>
        <button 
          onClick={() => setShowAuthModal(true)}
          className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 text-sm cursor-pointer"
        >
          <span>Sign in with Google</span>
        </button>
      </header>

      {/* תוכן מרכזי של דף הנחיתה */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto space-y-12 py-12">
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-6xl font-black text-gray-950 tracking-tight">
            StudyHub
          </h1>
          <h2 className="text-3xl sm:text-4xl font-black text-indigo-600">
            Learn Better, Together.
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Join thousands of students collaborating in real-time. Create study groups, share resources, and ace your exams with StudyHub.
          </p>
        </div>

        {/* שלוש קוביות הפיצ'רים */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pt-6">
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm flex flex-col items-center space-y-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BookOpen size={24} /></div>
            <h3 className="font-bold text-gray-900">Shared Knowledge</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Access notes and materials from your peers.</p>
          </div>
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm flex flex-col items-center space-y-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Users size={24} /></div>
            <h3 className="font-bold text-gray-900">Group Study</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Find study partners for any subject.</p>
          </div>
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm flex flex-col items-center space-y-3">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Calendar size={24} /></div>
            <h3 className="font-bold text-gray-900">Smart Planning</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Coordinate meetings and stay on track.</p>
          </div>
        </div>
      </main>

      {/* מודאל ההתחברות שנפתח בלחיצה */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Auth onClose={() => setShowAuthModal(false)} />
        </div>
      )}
    </div>
  );
}