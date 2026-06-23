import React, { useState } from 'react';
import { auth } from '../firebase';
import { createNotice, deleteNoticeApi, improveNoticeApi } from '../services/noticeService';
import { cn } from '../lib/utils';
import { Trash2, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import ConfirmModal from './ConfirmModal';

export default function NoticesTab({
  groupId,
  notices,
  setNotices,
  refreshAllData,
  showToast
}) {
  const { t, isRTL } = useLanguage();

  // New notice state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [isImprovingNotice, setIsImprovingNotice] = useState(false);
  const [aiNoticeSuggestion, setAiNoticeSuggestion] = useState('');

  // Delete modal state
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

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim() || !auth.currentUser) return;

    try {
      const newNotice = await createNotice({
        groupId,
        authorId: auth.currentUser.uid,
        title: noticeTitle.trim(),
        content: noticeContent.trim()
      });

      setNotices(prev => [newNotice, ...prev]);
      setNoticeTitle('');
      setNoticeContent('');
      setAiNoticeSuggestion('');
      notify(t('createNotice') || "Notice Posted", t('saved') || "Notice published successfully!", 'success');
    } catch (error) {
      console.error('Failed to post notice:', error);
      notify(t('error') || 'Error', error.message || 'Failed to post notice', 'error');
    }
  };

  const handleAiImprove = async () => {
    const trimmed = noticeContent.trim();
    if (!trimmed) {
      notify(t('error') || 'Error', isRTL ? 'אנא הזן תוכן למודעה לפני השיפור' : 'Please enter notice content before improving', 'error');
      return;
    }

    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount < 5) {
      notify(
        t('error') || 'Error',
        isRTL
          ? 'נא לכתוב לפחות 5 מילים כדי שלבינה המלאכותית יהיה על מה להתבסס.'
          : 'Please write at least 5 words so the AI can base its improvement on it.',
        'error'
      );
      return;
    }

    setIsImprovingNotice(true);
    setAiNoticeSuggestion('');
    try {
      const data = await improveNoticeApi(trimmed);
      if (data.improvedText) {
        setAiNoticeSuggestion(data.improvedText);
        notify(
          isRTL ? 'הצעה מוכנה' : 'Suggestion ready',
          isRTL ? 'ה-AI הציע גרסה משופרת לטקסט שלך' : 'AI suggested an improved version of your text',
          'success'
        );
      }
    } catch (error) {
      if (error.message === 'ERROR_INAPPROPRIATE_CONTENT' || error.message.includes('inappropriate') || error.message.includes('unrelated')) {
        notify(
          t('error') || 'Error',
          isRTL
            ? 'התוכן שרשמת אינו הולם או שאינו קשור לפעילות קבוצת לימוד.'
            : 'The content you entered is inappropriate or unrelated to study group activities.',
          'error'
        );
      } else if (error.message === 'ERROR_AI_OVERLOAD' || error.status === 503 || error.message.includes('OVERLOAD') || error.message.includes('overload') || error.message.includes('503')) {
        notify(
          t('error') || 'Error',
          isRTL
            ? 'עקב עומס נסה שוב מאוחר יותר.'
            : 'Due to heavy load, please try again later.',
          'error'
        );
      } else {
        notify(
          t('error') || 'Error',
          isRTL ? 'שיפור הטקסט נכשל. נסה שנית מאוחר יותר.' : 'Failed to improve text. Please try again later.',
          'error'
        );
      }
    } finally {
      setIsImprovingNotice(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (aiNoticeSuggestion) {
      setNoticeContent(aiNoticeSuggestion);
      setAiNoticeSuggestion('');
    }
  };

  const handleRejectSuggestion = () => {
    setAiNoticeSuggestion('');
  };

  const handleDeleteNotice = (notice) => {
    setConfirmModal({
      isOpen: true,
      title: t('deleteConfirm') || "Delete Notice",
      message: `${t('deleteConfirm') || "Are you sure you want to delete this?"} "${notice.title}"`,
      icon: Trash2,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteNoticeApi(notice.id, auth.currentUser.uid);
          setNotices(prev => prev.filter(n => n.id !== notice.id));
          notify(t('deleteConfirm') || "Notice Deleted", t('saved') || "Notice deleted successfully", 'success');
        } catch (error) {
          console.error("Failed to delete notice:", error);
          notify(t('error') || 'Error', error.message || 'Failed to delete notice', 'error');
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Notice Board List */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-900">{t('noticeBoard')}</h3>
        {notices.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-8 bg-white rounded-3xl border border-gray-100 shadow-sm">{t('noNoticesYet') || 'No notices posted yet'}</p>
        )}
        {notices.map(notice => (
          <div key={notice.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2 text-left animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <h4 className="font-bold text-sm text-indigo-600">{notice.title}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-gray-400">{format(new Date(notice.createdAt), 'dd/MM/yyyy')}</span>
                {auth.currentUser && String(notice.authorId) === String(auth.currentUser.uid) && (
                  <button
                    onClick={() => handleDeleteNotice(notice)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer bg-transparent border-none"
                    title={t('deleteConfirm') || 'Delete Notice'}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{notice.content}</p>
            <p className="text-[10px] text-gray-400 pt-1 font-bold">{t('by') || 'By:'} {notice.authorName}</p>
          </div>
        ))}
      </div>

      {/* Post notice form */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
        <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2 mb-4">{t('postNewNotice') || 'Post New Notice'}</h3>
        <form onSubmit={handlePostNotice} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-gray-400 uppercase">{t('noticeTitle') || 'Title'}</label>
            <input
              type="text" required placeholder={isRTL ? "לדוגמה: שינוי מיקום המפגש" : "e.g. Change in Meeting Location"}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">{t('noticeContent') || 'Content'}</label>
              <button
                type="button"
                onClick={handleAiImprove}
                disabled={isImprovingNotice}
                title={isImprovingNotice ? t('improving') : t('aiImprove')}
                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center bg-transparent"
              >
                {isImprovingNotice ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-amber-500" />}
              </button>
            </div>
            <textarea
              required rows={4} placeholder={isRTL ? "כתוב את העדכון שלך עבור הקבוצה..." : "Write down your updates for the group..."}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)}
            />
          </div>

          {aiNoticeSuggestion && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-3 animate-fade-in text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>{t('aiSuggestion')}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAcceptSuggestion}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-sm shadow-amber-100 border-none"
                  >
                    {t('accept')}
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectSuggestion}
                    className="text-xs bg-white hover:bg-gray-50 text-gray-500 font-bold px-2.5 py-1 border border-gray-200 rounded-lg transition-all cursor-pointer"
                  >
                    {t('decline')}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 bg-white/60 p-3 rounded-xl border border-amber-100/50 leading-relaxed max-h-32 overflow-y-auto">
                {aiNoticeSuggestion}
              </p>
            </div>
          )}

          <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 text-xs cursor-pointer border-none">
            {t('postUpdate') || 'Post Update'}
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
