// client/src/components/NotificationManager.jsx
import React, { useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { mockChatMessages, mockMeetings } from '../mock/mockData';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotificationManager({ onNotify }) {
  const { t } = useLanguage();
  const simulatedToastsRef = useRef({ chat: false, meeting: false });

  useEffect(() => {
    if (!auth.currentUser) return;

    console.log("Mock Notification Manager initialized");

    // סימולציה: נקפיץ התראות דמה לאחר 3 שניות מהפעלת האפליקציה כדי לבדוק שהרכיב עובד
    const timer = setTimeout(() => {
      // 1. התראת צ'אט מדומה (רק אם המשתמש הפעיל התראות צ'אט באובייקט המשתמש)
      if (auth.currentUser.notificationSettings?.chat && !simulatedToastsRef.current.chat) {
        const latestMsg = mockChatMessages[0];
        if (latestMsg && latestMsg.senderId !== auth.currentUser.uid) {
          onNotify(
            t('newChatMessage'),
            `${latestMsg.senderName}: ${latestMsg.text}`,
            'chat',
            latestMsg.groupId
          );
          simulatedToastsRef.current.chat = true;
        }
      }

      // 2. התראת פגישה מדומה (רק אם המשתמש הפעיל התראות מפגשים)
      if (auth.currentUser.notificationSettings?.meetings && !simulatedToastsRef.current.meeting) {
        const latestMeeting = mockMeetings[0];
        if (latestMeeting && latestMeeting.creatorId !== auth.currentUser.uid) {
          onNotify(
            t('newMeetingScheduled'),
            latestMeeting.title,
            'meeting',
            latestMeeting.groupId
          );
          simulatedToastsRef.current.meeting = true;
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onNotify, t]);

  return null;
}