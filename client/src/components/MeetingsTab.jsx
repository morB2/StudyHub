import React, { useState } from 'react';
import { auth } from '../firebase';
import { scheduleMeetingApi, normalizeMeeting, deleteMeetingApi } from '../services/meetingService';
import { cn } from '../lib/utils';
import { Clock, MapPin, Video, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmModal from './ConfirmModal';

export default function MeetingsTab({
  groupId,
  meetings,
  setMeetings,
  groupDetails,
  refreshAllData,
  showToast
}) {
  const { t, isRTL } = useLanguage();

  // New meeting inputs
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');

  // Delete modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    icon: null,
    type: 'indigo',
    targetId: null
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

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!meetingTitle.trim() || !meetingDate || !meetingTime || !auth.currentUser) {
      notify(t('error'), t('fillRequiredFields'), 'error');
      return;
    }

    const startTime = new Date(`${meetingDate}T${meetingTime}`);
    const now = new Date();

    if (startTime < now) {
      notify(t('error'), t('pastDateError'), 'error');
      return;
    }

    try {
      const response = await scheduleMeetingApi({
        groupId,
        title: meetingTitle.trim(),
        startTime: startTime.toISOString(),
        location: meetingLocation.trim() || 'Online',
        creatorId: auth.currentUser.uid
      });

      const newMeet = normalizeMeeting(response);
      setMeetings(prev => [...prev, newMeet].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));

      setMeetingTitle('');
      setMeetingDate('');
      setMeetingTime('');
      setMeetingLocation('');
      notify(t('scheduleMeeting'), t('meetingScheduledSuccess'), 'success');
    } catch (error) {
      console.error("Failed to schedule meeting:", error);
      notify(t('error'), error.message || t('unknownServerError'), 'error');
    }
  };

  const promptDeleteMeeting = (meeting) => {
    setConfirmModal({
      isOpen: true,
      title: t('deleteMeeting') || 'Cancel Meeting',
      message: `${t('deleteMeetingConfirm') || 'Are you sure you want to cancel the meeting?'} "${meeting.title}"`,
      icon: Trash2,
      type: 'danger',
      targetId: meeting.id,
      onConfirm: async () => {
        try {
          if (!auth.currentUser) {
            notify(t('error') || 'Error', t('notAuthenticated') || 'Please sign in first.', 'error');
            return;
          }
          await deleteMeetingApi(meeting.id, auth.currentUser.uid);
          setMeetings(prev => prev.filter(m => m.id !== meeting.id));
          notify(t('scheduleMeeting') || 'Meeting', t('deleteMeetingSuccess') || 'Meeting cancelled successfully!', 'success');
        } catch (error) {
          console.error("Failed to delete meeting:", error);
          const errorMsg = error.status === 403
            ? (t('deleteMeetingError') || "You do not have permission to delete this meeting.")
            : (error.message || t('unknownServerError') || "Failed to delete meeting");
          notify(t('error') || 'Error', errorMsg, 'error');
        }
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* List of upcoming meetings */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2">{t('upcomingMeetings')}</h3>
        <div className="max-h-[380px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {meetings.length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-8">{t('noMeetings')}</p>
          )}
          {meetings.map(meet => {
            let dateObj;
            try {
              dateObj = new Date(meet.startTime);
            } catch (e) {
              dateObj = new Date();
            }

            const formattedDay = format(dateObj, 'dd');
            const formattedMonth = format(dateObj, 'MMM').toUpperCase();
            const formattedTime = format(dateObj, 'HH:mm');

            const isLink = meet.location && (/^https?:\/\//i.test(meet.location) || /^(zoom\.us|meet\.google\.com|teams\.microsoft\.com|teams\.live.com)/i.test(meet.location));
            const href = isLink ? (/^https?:\/\//i.test(meet.location) ? meet.location : `https://${meet.location}`) : '';

            let displayLoc = meet.location === 'Online' ? t('online') : meet.location;
            let linkLabel = displayLoc;
            if (isLink) {
              if (meet.location.toLowerCase().includes('zoom.us')) {
                linkLabel = 'Zoom Meeting';
              } else if (meet.location.toLowerCase().includes('meet.google.com')) {
                linkLabel = 'Google Meet';
              } else if (meet.location.toLowerCase().includes('teams.microsoft.com') || meet.location.toLowerCase().includes('teams.live.com')) {
                linkLabel = 'Microsoft Teams';
              }
            }

            return (
              <div key={meet.id} className={cn("flex gap-4 p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-100/60 shadow-sm transition-all items-center group", isRTL ? "text-right" : "text-left")}>
                {/* Styled Date Box */}
                <div className="flex flex-col items-center justify-center w-14 h-16 bg-purple-50 rounded-xl overflow-hidden border border-purple-100 flex-shrink-0">
                  <div className="w-full bg-purple-600 text-[9px] font-bold text-white py-0.5 text-center tracking-wider uppercase">
                    {formattedMonth}
                  </div>
                  <div className="flex-1 flex items-center justify-center text-lg font-black text-purple-900 leading-none">
                    {formattedDay}
                  </div>
                </div>

                {/* Meeting info */}
                <div className="flex-1 min-w-0 font-sans">
                  <h4 className="font-extrabold text-sm text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                    {meet.title}
                  </h4>
                  <div className={cn("flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400 font-medium", isRTL && "flex-row-reverse justify-end")}>
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-gray-400" />
                      <span>{formattedTime}</span>
                    </div>
                    <div className="flex items-center gap-1 min-w-0 font-medium">
                      {isLink ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 hover:underline font-bold transition-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Video size={12} className="text-purple-500 flex-shrink-0" />
                          <span className="truncate">{linkLabel}</span>
                        </a>
                      ) : (
                        <>
                          <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{displayLoc}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                {(() => {
                  const isAuthorizedToDelete = auth.currentUser && (
                    String(meet.creatorId) === String(auth.currentUser.uid) ||
                    String(groupDetails.creatorId) === String(auth.currentUser.uid)
                  );
                  return (
                    <button
                      type="button"
                      disabled={!isAuthorizedToDelete}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAuthorizedToDelete) {
                          promptDeleteMeeting(meet);
                        }
                      }}
                      className={cn(
                        "p-2 rounded-xl transition-all flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 border-none bg-transparent",
                        isAuthorizedToDelete
                          ? "text-gray-400 hover:text-rose-600 hover:bg-rose-50/50 cursor-pointer"
                          : "text-gray-300 cursor-not-allowed opacity-40 group-hover:opacity-40"
                      )}
                      title={isAuthorizedToDelete ? (t('deleteMeeting') || 'Cancel Meeting') : undefined}
                    >
                      <Trash2 size={16} />
                    </button>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule meeting form */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2 mb-4">{t('scheduleMeeting')}</h3>
        <form onSubmit={handleScheduleMeeting} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase">{t('meetingTitle')}</label>
            <input
              type="text" required placeholder={t('meetingTitlePlaceholder')}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">{t('meetingDate')}</label>
              <input
                type="date" required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">{t('meetingTime')}</label>
              <input
                type="time" required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase">{t('location')}</label>
            <input
              type="text" placeholder={t('meetingLocationPlaceholder')}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={meetingLocation} onChange={(e) => setMeetingLocation(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 text-xs cursor-pointer border-none">
            {t('schedule')}
          </button>
        </form>
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
