// client/src/components/CreateGroup.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import { mockGroups } from '../mock/mockData';
import { cn } from '../lib/utils';
import { X, Plus, BookOpen, FileText, Lock, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function CreateGroup({ onClose }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      // יצירת מזהה ייחודי מדומה לקבוצה החדשה
      const generatedId = 'group_' + Math.random().toString(36).substr(2, 9);
      
      const newGroup = {
        id: generatedId,
        name,
        subject,
        description,
        creatorId: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        isPrivate,
        createdAt: new Date() // שימוש בתאריך רגיל במקום Timestamp של פיירבייס
      };

      // דחיפת הקבוצה החדשה למערך הגלובלי המדומה
      mockGroups.push(newGroup);
      console.log("Mock Group Created Successfully:", newGroup);
      
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden relative transform transition-all scale-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Plus size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t('createGroup')}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            {/* Group Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Group Name</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Computer Science"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Subject / Course Code</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="e.g. CS101"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Description</label>
              <textarea
                placeholder="What is this group for? Share goals, meeting times, etc."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Privacy Toggle */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer",
                  !isPrivate ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-400 hover:border-gray-200"
                )}
              >
                <Globe size={18} />
                <span className="font-bold">Public</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer",
                  isPrivate ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-100 text-gray-400 hover:border-gray-200"
                )}
              >
                <Lock size={18} />
                <span className="font-bold">Private</span>
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}