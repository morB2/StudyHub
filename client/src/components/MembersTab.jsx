import React, { useState } from 'react';
import { auth } from '../firebase';
import { leaveGroupApi } from '../services/groupService';
import { cn } from '../lib/utils';
import { UserMinus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmModal from './ConfirmModal';

export default function MembersTab({
  groupDetails,
  groupMembers,
  onBack,
  showToast
}) {
  const { t } = useLanguage();

  // Leave confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    icon: null,
    type: 'indigo'
  });

  const notify = (title, description, type = 'info') => {
    if (typeof showToast === 'function') {
      showToast(title, description, type);
    } else {
      if (type === 'error') {
        console.error(`${title}: ${description}`);
      } else {
        console.log(`${title}: ${description}`);
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (!auth.currentUser) return;

    setConfirmModal({
      isOpen: true,
      title: t('leaveGroup') || "Leave Group",
      message: t('confirmLeaveGroup') || "Are you sure you want to leave this group?",
      icon: UserMinus,
      type: 'danger',
      onConfirm: async () => {
        try {
          const userId = auth.currentUser.uid;
          await leaveGroupApi(groupDetails.id, userId);

          notify(t('leaveGroup'), t('leftGroup') || "Left group successfully", 'success');

          // Close confirm modal
          setConfirmModal(prev => ({ ...prev, isOpen: false }));

          // Navigate back
          onBack();
        } catch (error) {
          console.error("Error leaving group:", error);
          notify(t('error') || "Error", error.message, 'error');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-gray-50 pb-4">
        <h3 className="text-sm font-black text-gray-900">{t('groupMembers')} ({groupMembers.length})</h3>
        <button
          onClick={handleLeaveGroup}
          className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all cursor-pointer border-none"
        >
          {t('leaveGroup')}
        </button>
      </div>

      <div className="space-y-3">
        {groupMembers.map(member => (
          <div key={member.uid} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-2xl border border-gray-100/60">
            <div className="flex items-center gap-3">
              {member.photoURL ? (
                <img src={member.photoURL} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 text-xs font-bold flex items-center justify-center uppercase">
                  {member.displayName ? member.displayName[0] : '?'}
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">{member.displayName}</p>
                <p className="text-[10px] text-gray-400">{member.email}</p>
              </div>
            </div>
            {(String(member.uid) === String(groupDetails.creatorId) || Number(member.uid) === Number(groupDetails.creatorId)) && (
              <span className="text-[9px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase">Admin</span>
            )}
          </div>
        ))}
      </div>

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
