// client/src/components/GroupList.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { fetchGroupsApi, joinGroupApi, leaveGroupApi, fetchGroupByIdApi } from '../services/groupService';
import { Users, BookOpen, Search, ArrowRight, UserPlus, UserMinus, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmModal from './ConfirmModal';
import GroupFilters from './GroupFilters';
import GroupFollowToggle from './GroupFollowToggle';

export default function GroupList({ onSelectGroup, showToast }) {
  const { t, isRTL } = useLanguage();
  const [groups, setGroups] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    sortBy: 'newest'
  });
  const [loading, setLoading] = useState(true);

  // Reusable confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    icon: null,
    type: 'indigo'
  });

  const triggerConfirm = (params) => {
    setConfirmModal({
      isOpen: true,
      ...params
    });
  };

  // Fetch groups from the server
  useEffect(() => {
    let active = true;
    const loadGroups = async () => {
      try {
        setLoading(true);
        const data = await fetchGroupsApi();
        if (active) {
          setGroups(data);
        }
      } catch (error) {
        console.error("Failed to load groups:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadGroups();
    return () => { active = false; };
  }, []);

  const proceedJoin = async (group, userId) => {
    try {
      await joinGroupApi(group.id, userId);
      setGroups(prev => prev.map(g => {
        if (g.id === group.id) {
          return { ...g, members: [...g.members, userId] };
        }
        return g;
      }));
      showToast(t('joinGroup'), t('joinedGroup'), "success");
    } catch (error) {
      console.error("Error joining group:", error);
      showToast(t('error') || "Error", error.message, "error");
    }
  };

  const proceedLeave = async (group, userId) => {
    try {
      await leaveGroupApi(group.id, userId);
      setGroups(prev => prev.map(g => {
        if (g.id === group.id) {
          return { ...g, members: g.members.filter(uid => String(uid) !== String(userId)) };
        }
        return g;
      }));
      showToast(t('leaveGroup'), t('leftGroup'), "success");
    } catch (error) {
      console.error("Error leaving group:", error);
      showToast(t('error') || "Error", error.message, "error");
    }
  };

  // Update membership status using API
  const handleJoinLeave = async (e, group) => {
    e.stopPropagation();
    if (!auth.currentUser) {
      showToast("Authentication Required", "Please sign in to join groups", "error");
      return;
    }

    const userId = auth.currentUser.uid;
    const isMember = group.members.includes(userId) ||
      group.members.includes(Number(userId)) ||
      group.members.includes(String(userId));

    if (isMember) {
      triggerConfirm({
        title: t('leaveGroup') || "Leave Group",
        message: t('confirmLeaveGroup') || "Are you sure you want to leave this group?",
        icon: UserMinus,
        type: 'danger',
        onConfirm: () => proceedLeave(group, userId)
      });
    } else {
      triggerConfirm({
        title: t('joinGroup') || "Join Group",
        message: t('confirmJoinPrompt') || "Are you sure you want to join this group?",
        icon: UserPlus,
        type: 'indigo',
        onConfirm: () => proceedJoin(group, userId)
      });
    }
  };

  const handleJoinAndSelect = async (group) => {
    if (!auth.currentUser) {
      showToast("Authentication Required", "Please sign in to join groups", "error");
      return;
    }
    const userId = auth.currentUser.uid;
    try {
      await joinGroupApi(group.id, userId);

      // Fetch the fresh group details directly from the API
      const updatedGroup = await fetchGroupByIdApi(group.id);

      // Update state
      setGroups(prev => prev.map(g => {
        if (g.id === group.id) {
          return updatedGroup;
        }
        return g;
      }));

      showToast(t('joinGroup'), t('joinedGroup'), "success");

      // Select group immediately
      onSelectGroup(updatedGroup);
    } catch (error) {
      console.error("Error joining group:", error);
      showToast(t('error') || "Error", error.message, "error");
    }
  };

  // סינון ופיקוח על הטרמינל
  const filteredGroups = groups.filter(g => {
    const isMember = auth.currentUser && (
      g.members.includes(auth.currentUser.uid) ||
      g.members.includes(Number(auth.currentUser.uid)) ||
      g.members.includes(String(auth.currentUser.uid))
    );
    const isPublic = !g.isPrivate;
    const matchesSearch =
      !filters.search ||
      g.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      g.subject.toLowerCase().includes(filters.search.toLowerCase());

    const matchesSubject =
      !filters.subject ||
      g.subject === filters.subject;

    return matchesSearch && matchesSubject && (isPublic || isMember);
  });

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (filters.sortBy === 'alphabetical') {
      return a.name.localeCompare(b.name);
    } else if (filters.sortBy === 'popular') {
      return (b.members?.length || 0) - (a.members?.length || 0);
    } else {
      // Default: newest
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const myGroups = sortedGroups.filter(g => auth.currentUser && g.members.includes(auth.currentUser.uid));
  const discoverGroups = sortedGroups.filter(g => !auth.currentUser || !g.members.includes(auth.currentUser.uid));

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
                onClick={async () => {
                  if (isMember) {
                    try {
                      const freshGroup = await fetchGroupByIdApi(group.id);
                      onSelectGroup(freshGroup);
                    } catch (err) {
                      console.error("Error fetching fresh group details:", err);
                      onSelectGroup(group);
                    }
                  } else {
                    triggerConfirm({
                      title: t('joinGroup') || "Join Group",
                      message: t('confirmJoinPrompt') || "To enter the group and view its materials, you must be registered. Would you like to join and enter?",
                      icon: UserPlus,
                      type: 'indigo',
                      onConfirm: () => handleJoinAndSelect(group)
                    });
                  }
                }}
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
                    {group.description || t('noDescription')}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Users size={16} />
                    <span>{group.members.length} {t('members')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GroupFollowToggle
                      groupId={group.id}
                      userId={auth.currentUser?.uid}
                      showToast={showToast}
                    />
                    <button
                      onClick={(e) => handleJoinLeave(e, group)}
                      className={cn(
                        "p-2 rounded-lg transition-all cursor-pointer",
                        isMember
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      )}
                      title={isMember ? t('leaveGroup') : t('joinGroup')}
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

  const uniqueSubjects = Array.from(new Set(groups.map(g => g.subject).filter(Boolean)));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
            <Users className="text-white" size={24} />
          </div>
          {t('groupStudy' || 'Study Groups')}
        </h2>
      </div>

      <GroupFilters
        subjects={uniqueSubjects}
        filters={filters}
        onFilterChange={setFilters}
      />

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

      {/* Reusable Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        icon={confirmModal.icon}
        type={confirmModal.type}
      />
    </div>
  );
}

// פונקציית עזר פשוטה לחיבור קלאסים מותנים במקום ספריית clsx חיצונית
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}