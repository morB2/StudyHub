// client/src/components/GroupList.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { mockGroups } from '../mock/mockData';
import { Users, BookOpen, Search, ArrowRight, UserPlus, UserMinus, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

export default function GroupList({ onSelectGroup }) {
  const { t, isRTL } = useLanguage();
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // סימולציית טעינה קצרה ואז משיכת נתונים מה-Mock Data
  useEffect(() => {
    const timer = setTimeout(() => {
      setGroups([...mockGroups]);
      setLoading(false);
    }, 400); // טעינה מדומה של 400 מילישניות בשביל האפקט של ה-Skeleton
    return () => clearTimeout(timer);
  }, []);

  // עדכון מצב הצטרפות או עזיבה מקומית בזיכרון ה-Mock Data
  const handleJoinLeave = (e, group) => {
    e.stopPropagation();
    if (!auth.currentUser) {
      alert("Please sign in to join groups");
      return;
    }

    const currentGroup = mockGroups.find(g => g.id === group.id);
    if (!currentGroup) return;

    const isMember = currentGroup.members.includes(auth.currentUser.uid);

    if (isMember) {
      // עזיבת קבוצה
      currentGroup.members = currentGroup.members.filter(uid => uid !== auth.currentUser.uid);
    } else {
      // הצטרפות לקבוצה
      currentGroup.members.push(auth.currentUser.uid);
    }

    // רענון הסטייט המקומי כדי שהשינוי ישתקף מיד במסך
    setGroups([...mockGroups]);
  };

  // סינון ופיקוח על הטרמינל
  const filteredGroups = groups.filter(g => {
    const isMember = auth.currentUser && g.members.includes(auth.currentUser.uid);
    const isPublic = !g.isPrivate;
    const matchesSearch = 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch && (isPublic || isMember);
  });

  const myGroups = filteredGroups.filter(g => auth.currentUser && g.members.includes(auth.currentUser.uid));
  const discoverGroups = filteredGroups.filter(g => !auth.currentUser || !g.members.includes(auth.currentUser.uid));

  // תת-קומפוננטה פנימית להצגת הגריד המעוצב שלך
  const GroupGrid = ({ groups, title }) => {
    if (groups.length === 0) return null;
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 px-1">
          <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => {
            const isMember = auth.currentUser && group.members.includes(auth.currentUser.uid);
            return (
              <div 
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider flex items-center gap-1">
                      {group.isPrivate && <Lock size={10} />}
                      {group.subject}
                    </span>
                    <span className="text-xs text-gray-400">
                      {group.createdAt?.toDate 
                        ? format(group.createdAt.toDate(), 'MMM d, yyyy') 
                        : format(new Date(group.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors text-left">
                    {group.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4 text-left">
                    {group.description || 'No description provided.'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Users size={16} />
                    <span>{group.members.length} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleJoinLeave(e, group)}
                      className={cn(
                        "p-2 rounded-lg transition-all cursor-pointer",
                        isMember 
                          ? "bg-red-50 text-red-600 hover:bg-red-100" 
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      )}
                      title={isMember ? "Leave Group" : "Join Group"}
                    >
                      {isMember ? <UserMinus size={18} /> : <UserPlus size={18} />}
                    </button>
                    <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ArrowRight size={18} className={isRTL ? "rotate-180" : ""} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
            <Users className="text-white" size={24} />
          </div>
          {t('groupStudy' || 'Study Groups')}
        </h2>
        <div className="relative max-w-md w-full">
          <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} size={18} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className={`w-full py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="space-y-12">
          <GroupGrid groups={myGroups} title={t('myGroups')} />
          <GroupGrid groups={discoverGroups} title={t('discoverGroups')} />
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('noGroups')}</h3>
          <p className="text-gray-500 max-w-xs mx-auto">{t('noGroupsDesc')}</p>
        </div>
      )}
    </div>
  );
}

// פונקציית עזר פשוטה לחיבור קלאסים מותנים במקום ספריית clsx חיצונית
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}