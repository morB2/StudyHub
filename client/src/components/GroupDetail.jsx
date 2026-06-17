// client/src/components/GroupDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import {
  mockChatMessages, mockMaterials,
  mockFolders, mockInvitations, mockUsers
} from '../mock/mockData';
import { getFoldersByGroup } from '../services/folderService';
import { getMaterialsByGroup } from '../services/materialService';
import { getMeetingsByGroupApi, scheduleMeetingApi, normalizeMeeting } from '../services/meetingService';
import { getNoticesByGroup } from '../services/noticeService';
import { joinGroupApi, fetchGroupByIdApi } from '../services/groupService';
import { cn } from '../lib/utils';
import {
  MessageSquare, FileText, Calendar, Plus, X, ArrowLeft, Users,
  Info, Sparkles, Video, UserPlus, Mail, Lock
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import VideoCall from './VideoCall';
import AIAssistant from './AIAssistant';
import GroupFollowToggle from './GroupFollowToggle';

// Sub-components
import ChatTab from './ChatTab';
import MaterialsTab from './MaterialsTab';
import MeetingsTab from './MeetingsTab';
import NoticesTab from './NoticesTab';
import MembersTab from './MembersTab';

export default function GroupDetail({ group, onBack, showToast }) {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('chat');
  const [groupDetails, setGroupDetails] = useState(group);

  // Global group states synced with source of truth / mock data
  const [messages, setMessages] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [folders, setFolders] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [notices, setNotices] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);

  // Top header modals and overlays
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Header Schedule Meeting modal state
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDateTime, setMeetingDateTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingError, setMeetingError] = useState('');

  const isMember = auth.currentUser && groupDetails?.members?.some(uid => String(uid) === String(auth.currentUser.uid));

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

  const loadFolders = async () => {
    if (!groupDetails?.id) {
      setFolders([]);
      return;
    }

    try {
      const data = await getFoldersByGroup(groupDetails.id);
      if (Array.isArray(data)) {
        setFolders(data);
      } else {
        setFolders([]);
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
      setFolders(mockFolders.filter(f => f.groupId === groupDetails.id));
    }
  };

  const refreshAllData = async () => {
    if (!groupDetails?.id) {
      return;
    }

    const filteredMsgs = mockChatMessages
      .filter(m => m.groupId === groupDetails.id)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    setMessages(filteredMsgs);

    try {
      const serverMaterials = await getMaterialsByGroup(groupDetails.id);
      setMaterials(Array.isArray(serverMaterials) ? serverMaterials : []);
    } catch (error) {
      console.error('Failed to fetch materials from server:', error);
      setMaterials(mockMaterials.filter(m => m.groupId === groupDetails.id));
    }

    await loadFolders();

    try {
      const serverMeetings = await getMeetingsByGroupApi(groupDetails.id);
      const normalized = serverMeetings.map(normalizeMeeting);
      setMeetings(normalized);
    } catch (error) {
      console.error('Failed to fetch meetings from server:', error);
      setMeetings([]);
    }

    try {
      const serverNotices = await getNoticesByGroup(groupDetails.id);
      setNotices(Array.isArray(serverNotices) ? serverNotices : []);
    } catch (error) {
      console.error('Failed to fetch notices from server:', error);
      setNotices([]);
    }

    if (groupDetails.memberDetails && groupDetails.memberDetails.length > 0) {
      setGroupMembers(groupDetails.memberDetails);
    } else {
      try {
        const freshGroup = await fetchGroupByIdApi(groupDetails.id);
        if (freshGroup.memberDetails && freshGroup.memberDetails.length > 0) {
          setGroupMembers(freshGroup.memberDetails);
        } else {
          setGroupMembers(
            mockUsers.filter(user => freshGroup.members?.some(id => String(id) === String(user.uid)))
          );
        }
      } catch (err) {
        console.error("Error fetching group members from server:", err);
        setGroupMembers(
          mockUsers.filter(user => groupDetails.members?.some(id => String(id) === String(user.uid)))
        );
      }
    }
  };

  const handleJoinFromDetail = async () => {
    if (!auth.currentUser) {
      notify(t('error') || 'Error', t('notAuthenticated') || 'Please sign in to join this group.', 'error');
      return;
    }

    try {
      await joinGroupApi(groupDetails.id, auth.currentUser.uid);
      const updatedGroup = await fetchGroupByIdApi(groupDetails.id);
      setGroupDetails(updatedGroup);
      notify(t('joinGroup'), t('joinedGroup'), 'success');
      await refreshAllData();
    } catch (error) {
      console.error('Join failed:', error);
      notify(t('error') || 'Error', error.message || t('unknownServerError') || 'Unable to join the group.', 'error');
    }
  };

  useEffect(() => {
    setGroupDetails(group);
  }, [group]);

  useEffect(() => {
    const loadData = async () => {
      await refreshAllData();
    };
    loadData();
  }, [groupDetails.id]);

  const handleScheduleMeetingModalSubmit = async (e) => {
    e.preventDefault();
    setMeetingError("");

    if (!meetingTitle.trim() || !meetingDateTime || !auth.currentUser) {
      setMeetingError(t('fillRequiredFields'));
      return;
    }

    const startTime = new Date(meetingDateTime);
    const now = new Date();

    if (startTime < now) {
      setMeetingError(t('pastDateError'));
      return;
    }

    try {
      const response = await scheduleMeetingApi({
        groupId: groupDetails.id,
        title: meetingTitle.trim(),
        startTime: startTime.toISOString(),
        location: meetingLocation.trim() || 'Online',
        creatorId: auth.currentUser.uid
      });

      const newMeet = normalizeMeeting(response);
      setMeetings(prev => [...prev, newMeet].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));

      setMeetingTitle('');
      setMeetingDateTime('');
      setMeetingLocation('');
      setShowMeetingModal(false);
      setActiveTab('meetings');
      notify(t('scheduleMeeting'), t('meetingScheduledSuccess'), 'success');
    } catch (error) {
      console.error("Failed to schedule meeting from modal:", error);
      setMeetingError(error.message || t('unknownServerError'));
    }
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !auth.currentUser) return;

    const invite = {
      id: 'inv_' + Math.random().toString(36).substr(2, 9),
      groupId: groupDetails.id,
      groupName: groupDetails.name,
      inviterId: auth.currentUser.uid,
      inviterName: auth.currentUser.displayName || 'Anonymous',
      inviteeEmail: inviteEmail.trim().toLowerCase(),
      status: 'pending',
      createdAt: new Date()
    };

    mockInvitations.push(invite);
    setInviteEmail('');
    setShowInviteModal(false);
    notify(t('inviteSent'), "", "success");
    refreshAllData();
  };

  if (!isMember) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden text-center">
          {/* Decorative background gradients */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl"></div>

          <button
            onClick={onBack}
            className="absolute top-6 left-6 p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition-all cursor-pointer border border-gray-100 bg-transparent"
          >
            <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          </button>

          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-100 shadow-inner">
            <Lock size={36} className="text-indigo-600 animate-bounce" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
            {groupDetails.name}
          </h2>
          <div className="text-center mb-6">
            <span className="text-indigo-600 font-bold text-sm bg-indigo-50/50 px-3 py-1.5 rounded-full inline-block">
              {groupDetails.subject}
            </span>
          </div>

          <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            {t('notAMemberDesc')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleJoinFromDetail}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm cursor-pointer border-none"
            >
              <UserPlus size={18} />
              <span>{t('joinGroup')}</span>
            </button>
            <button
              onClick={onBack}
              className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all text-sm cursor-pointer"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

      {/* Back button & Main Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-600 shadow-sm transition-all cursor-pointer bg-transparent"
          >
            <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
          </button>
          <div className="text-left">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900">{groupDetails.name}</h1>
              {groupDetails.isPrivate && (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full uppercase">
                  Private
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">{groupDetails.subject} • {groupMembers.length} {t('members')}</p>
          </div>
        </div>

        {/* Top bar buttons */}
        <div className="flex items-center gap-2">
          <GroupFollowToggle
            groupId={groupDetails.id}
            userId={auth.currentUser?.uid}
            showToast={showToast}
          />

          <button
            onClick={() => setShowMeetingModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white border-none rounded-xl text-sm font-bold flex items-center gap-2 shadow-md shadow-purple-100 hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>{t('scheduleMeeting')}</span>
          </button>

          <button
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer border",
              showAiAssistant
                ? "bg-amber-500 border-amber-500 text-white shadow-amber-100"
                : "bg-white border-gray-100 text-amber-600 hover:bg-amber-50"
            )}
          >
            <Sparkles size={16} className={showAiAssistant ? "animate-pulse" : ""} />
            <span>AI Study Assistant</span>
          </button>

          {groupDetails.isPrivate && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserPlus size={16} />
              <span>{t('inviteMembers')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main layout split with AI Assistant if opened */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className={cn("lg:col-span-3 space-y-6", showAiAssistant && "lg:col-span-2")}>

          {/* Tabs Navbar */}
          <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex gap-1 overflow-x-auto">
            {[
              { id: 'chat', label: t('chat'), icon: MessageSquare },
              { id: 'materials', label: t('materials'), icon: FileText },
              { id: 'meetings', label: t('meetings'), icon: Calendar },
              { id: 'notices', label: t('noticeBoard'), icon: Info },
              { id: 'video', label: 'Video Call', icon: Video },
              { id: 'members', label: t('groupMembers'), icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-none bg-transparent",
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab contents */}
          {activeTab === 'chat' && (
            <ChatTab
              groupId={groupDetails.id} groupMembers={groupMembers}
            />
          )}

          {activeTab === 'materials' && (
            <MaterialsTab
              groupId={groupDetails.id}
              folders={folders}
              setFolders={setFolders}
              materials={materials}
              setMaterials={setMaterials}
              refreshAllData={refreshAllData}
              showToast={showToast}
            />
          )}

          {activeTab === 'meetings' && (
            <MeetingsTab
              groupId={groupDetails.id}
              meetings={meetings}
              setMeetings={setMeetings}
              groupDetails={groupDetails}
              refreshAllData={refreshAllData}
              showToast={showToast}
            />
          )}

          {activeTab === 'notices' && (
            <NoticesTab
              groupId={groupDetails.id}
              notices={notices}
              setNotices={setNotices}
              refreshAllData={refreshAllData}
              showToast={showToast}
            />
          )}

          {activeTab === 'video' && (
            <VideoCall groupId={groupDetails.id} onLeave={() => setActiveTab('chat')} />
          )}

          {activeTab === 'members' && (
            <MembersTab
              groupDetails={groupDetails}
              groupMembers={groupMembers}
              onBack={onBack}
              showToast={showToast}
            />
          )}

        </div>

        {/* AI Assistant Sidebar */}
        {showAiAssistant && (
          <div className="lg:col-span-1">
            <AIAssistant materials={materials} notices={notices} onClose={() => setShowAiAssistant(false)} />
          </div>
        )}
      </div>

      {/* Modal: Invite Members */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full border border-gray-100 shadow-2xl relative">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none"><X size={18} /></button>
            <h3 className="font-black text-gray-900 text-base mb-2 text-left">{t('inviteMembers')}</h3>
            <p className="text-xs text-gray-400 mb-4 text-left">{t('inviteDesc')}</p>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email" required placeholder={t('emailPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-xs cursor-pointer border-none">
                {t('sendInvite')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Meeting from Header */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full border border-gray-100 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => {
                setShowMeetingModal(false);
                setMeetingError("");
                setMeetingTitle("");
                setMeetingDateTime("");
                setMeetingLocation("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none"
            >
              <X size={18} />
            </button>
            <h3 className="font-black text-gray-900 text-lg mb-1 flex items-center gap-2 text-left">
              <Calendar className="text-purple-600" size={20} />
              <span>{t('scheduleNewMeeting')}</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4 text-left">{t('meetingDesc')}</p>

            {meetingError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-semibold text-left">
                {meetingError}
              </div>
            )}

            <form onSubmit={handleScheduleMeetingModalSubmit} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('meetingTitle')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('meetingTitlePlaceholder')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('meetingDateTime')}</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-sans"
                  value={meetingDateTime}
                  onChange={(e) => setMeetingDateTime(e.target.value)}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('locationOrLinkOptional')}</label>
                <input
                  type="text"
                  placeholder={t('meetingLocationPlaceholder')}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-100 text-sm cursor-pointer border-none"
              >
                {t('schedule')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}