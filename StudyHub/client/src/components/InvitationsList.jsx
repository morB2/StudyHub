// client/src/components/InvitationsList.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { mockInvitations, mockGroups } from '../mock/mockData';
import { Mail, Check, X, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function InvitationsList() {
  const { t } = useLanguage();
  const [invitations, setInvitations] = useState([]);

  // טעינת ההזמנות המדומות שרלוונטיות למייל של המשתמש הנוכחי ומצב פתוח
  useEffect(() => {
    if (!auth.currentUser?.email) return;
    
    const userEmail = auth.currentUser.email.toLowerCase();
    const pendingInvites = mockInvitations.filter(
      invite => invite.inviteeEmail.toLowerCase() === userEmail && invite.status === 'pending'
    );
    
    setInvitations(pendingInvites);
  }, []);

  // אישור הזמנה - הוספת המשתמש לקבוצה ושינוי סטטוס ההזמנה
  const handleAccept = async (invite) => {
    if (!auth.currentUser) return;

    try {
      // 1. מוצאים את הקבוצה המדומה ומוסיפים את ה-uid של המשתמש לרשימת החברים
      const group = mockGroups.find(g => g.id === invite.groupId);
      if (group && !group.members.includes(auth.currentUser.uid)) {
        group.members.push(auth.currentUser.uid);
      }

      // 2. מעדכנים את סטטוס ההזמנה ל-accepted
      const mockInvite = mockInvitations.find(i => i.id === invite.id);
      if (mockInvite) {
        mockInvite.status = 'accepted';
      }

      // 3. עדכון ה-State המקומי כדי שההזמנה תיעלם מהמסך
      setInvitations(prev => prev.filter(i => i.id !== invite.id));
      console.log(`Mock Invite Accepted! Joined group: ${invite.groupName}`);
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  // דחיית הזמנה - שינוי סטטוס בלבד
  const handleDecline = async (inviteId) => {
    try {
      const mockInvite = mockInvitations.find(i => i.id === inviteId);
      if (mockInvite) {
        mockInvite.status = 'declined';
      }
      
      setInvitations(prev => prev.filter(i => i.id !== inviteId));
      console.log(`Mock Invite Declined: ${inviteId}`);
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  };

  if (invitations.length === 0) return null;

  return (
    <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 mb-8 animate-fade-in">
      <h3 className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
        <Bell size={16} className="animate-bounce" />
        {t('invitations')} ({invitations.length})
      </h3>
      <div className="space-y-3">
        {invitations.map(invite => (
          <div key={invite.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between gap-4 border border-amber-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {invite.inviterName} invited you to join <span className="text-indigo-600">{invite.groupName}</span>
                </p>
                <p className="text-xs text-gray-400">Private Group</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleAccept(invite)}
                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all cursor-pointer"
                title={t('accept')}
              >
                <Check size={18} />
              </button>
              <button 
                onClick={() => handleDecline(invite.id)}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all cursor-pointer"
                title={t('decline')}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}