// client/src/components/GroupDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import {
  mockChatMessages, mockMaterials, mockMeetings,
  mockFolders, mockInvitations, mockUsers
} from '../mock/mockData';
import { createFolder, getFoldersByGroup, deleteFolder } from '../services/folderService';
import { getMaterialsByGroup, searchMaterialsByGroup, uploadMaterialApi, deleteMaterialApi, moveMaterialApi } from '../services/materialService';
import { getNoticesByGroup, createNotice, deleteNoticeApi, improveNoticeApi } from '../services/noticeService';
import { cn } from '../lib/utils';
import {
  MessageSquare, FileText, Calendar, Send, Trash2, Download, Plus, X,
  MapPin, Clock, ArrowLeft, Users, Bell, BellOff, Info, Upload, Sparkles,
  Video, UserPlus, UserMinus, Mail, FolderPlus, Folder as FolderIcon, ChevronRight,
  Search, Move, Mic, Square, Play, Pause, Lock, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import VideoCall from './VideoCall';
import AIAssistant from './AIAssistant';
import { joinGroupApi, fetchGroupByIdApi, leaveGroupApi } from '../services/groupService';
import ConfirmModal from './ConfirmModal';
import GroupFollowToggle from './GroupFollowToggle';

export default function GroupDetail({ group, onBack, showToast }) {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('chat');
  const [groupDetails, setGroupDetails] = useState(group);

  // State-ים מקומיים המסונכרנים עם ה-Mock Data הגלובלי
  const [messages, setMessages] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [folders, setFolders] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [notices, setNotices] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);

  // ניהול ניווט בתיקיות וחומרי לימוד
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [movingMaterial, setMovingMaterial] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchDebounceRef = useRef(null);

  // טפסים וקלטים חדשים
  const [newMessage, setNewMessage] = useState('');
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const fileInputRef = useRef(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [isImprovingNotice, setIsImprovingNotice] = useState(false);
  const [aiNoticeSuggestion, setAiNoticeSuggestion] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  // טוגלים ופאנלים צדדיים
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    icon: null,
    type: 'indigo',
    targetId: null,
    targetPath: ''
  });

  const chatBottomRef = useRef(null);
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

    const filteredMeetings = mockMeetings
      .filter(m => m.groupId === groupDetails.id)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    setMeetings(filteredMeetings);

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

  const executeSearch = async (query) => {
    if (!groupDetails?.id || !query.trim()) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    setIsSearchLoading(true);
    try {
      const results = await searchMaterialsByGroup(groupDetails.id, query.trim());
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error('Search failed, falling back to local search:', error);
      const localResults = materials.filter(m =>
        m.fileName && m.fileName.toLowerCase().includes(query.trim().toLowerCase())
      );
      setSearchResults(localResults);
    } finally {
      setIsSearchLoading(false);
    }
  };

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      executeSearch(searchQuery);
    }, 400);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, groupDetails.id]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchLoading(false);
  };

  useEffect(() => {
    setGroupDetails(group);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchLoading(false);
  }, [group]);

  useEffect(() => {
    const loadData = async () => {
      await refreshAllData();
    };

    loadData();
  }, [groupDetails.id]);

  // טעינת וסינון כל הנתונים המדומים השייכים לקבוצה הנוכחית בטעינה ראשונית
  useEffect(() => {
    const loadData = async () => {
      await refreshAllData();
    };

    loadData();
  }, [groupDetails.id]);

  useEffect(() => {
    if (activeTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // --- פעולות צ'אט ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    const msg = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      groupId: groupDetails.id,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || 'Anonymous',
      text: newMessage.trim(),
      type: 'text',
      createdAt: new Date()
    };

    mockChatMessages.push(msg);
    setNewMessage('');
    refreshAllData();
  };

  // הדמיית הקלטת שמע
  const toggleRecording = () => {
    if (!auth.currentUser) return;
    if (isRecording) {
      // סיום הקלטה מדומה - יצירת קובץ שמע דמה
      const audioMsg = {
        id: 'msg_' + Math.random().toString(36).substr(2, 9),
        groupId: groupDetails.id,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || 'Anonymous',
        type: 'audio',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // קובץ שמע חופשי אמיתי לניגון
        createdAt: new Date()
      };
      mockChatMessages.push(audioMsg);
      setIsRecording(false);
      refreshAllData();
    } else {
      setIsRecording(true);
    }
  };

  // --- פעולות חומרי לימוד ותיקיות ---
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      notify(t('error') || 'Error', t('notAuthenticated') || 'Please sign in to create a folder.', 'error');
      return;
    }

    const trimmedFolderName = newFolderName.trim();
    if (!trimmedFolderName) {
      notify(t('error') || 'Error', t('folderNameRequired') || 'Folder name is required.', 'error');
      return;
    }

    try {
      const creatorId = auth.currentUser?.id || auth.currentUser?.uid;
      const createdFolder = await createFolder({
        groupId: groupDetails.id,
        name: trimmedFolderName,
        parentId: currentFolderId,
        creatorId,
      });

      setFolders(prev => [...prev, createdFolder]);
      setNewFolderName('');
      setShowFolderModal(false);
      notify(t('folderCreated'), t('folderCreatedSuccess'), 'success');
    } catch (error) {
      console.error("Folder creation failed:", error);
      notify(t('folderCreateFailed') || 'Folder Error', error.message || t('unknownServerError') || 'Could not create folder.', 'error');
    }
  };

  const handleFileSelection = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setNewMaterialName(file.name);
    setNewMaterialUrl('');
  };

  const handleInputFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setNewMaterialUrl('');
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterialName.trim() || !auth.currentUser) return;
    if (!selectedFile && !newMaterialUrl.trim()) return;

    setUploadingMaterial(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('file_name', newMaterialName.trim());
        formData.append('group_id', groupDetails.id);
        if (currentFolderId) {
          formData.append('folder_id', currentFolderId);
        }
        formData.append('uploader_id', auth.currentUser.uid);

        const response = await uploadMaterialApi(formData);
        const uploadedMaterial = response.material || response.data || response;
        const fallbackFileUrl = URL.createObjectURL(selectedFile);

        if (uploadedMaterial) {
          const newMaterial = {
            id: uploadedMaterial.id || 'mat_' + Math.random().toString(36).substr(2, 9),
            groupId: groupDetails.id,
            uploaderId: auth.currentUser.uid,
            fileName: uploadedMaterial.fileName || newMaterialName.trim(),
            fileUrl: uploadedMaterial.fileUrl || fallbackFileUrl,
            folderId: uploadedMaterial.folderId ?? currentFolderId,
            createdAt: uploadedMaterial.createdAt ? new Date(uploadedMaterial.createdAt) : new Date(),
            storagePath: uploadedMaterial.storagePath,
          };

          mockMaterials.push(newMaterial);
          setMaterials(prev => [...prev, newMaterial]);
        }
      } else {
        const material = {
          id: 'mat_' + Math.random().toString(36).substr(2, 9),
          groupId: groupDetails.id,
          uploaderId: auth.currentUser.uid,
          fileName: newMaterialName.trim(),
          fileUrl: newMaterialUrl.trim(),
          folderId: currentFolderId,
          createdAt: new Date(),
          localUpload: false,
        };

        mockMaterials.push(material);
        setMaterials(prev => [...prev, material]);
      }

      setNewMaterialName('');
      setNewMaterialUrl('');
      setSelectedFile(null);
      refreshAllData();
    } catch (error) {
      console.error('Upload failed:', error);
      notify(t('error') || 'Error', error.message || 'Upload failed', 'error');
    } finally {
      setUploadingMaterial(false);
    }
  };

  const handleMoveMaterial = async (materialId, folderId) => {
    try {
      await moveMaterialApi(materialId, folderId);

      // Update local state
      setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, folderId } : m));

      // Update mock data for backward compatibility / offline fallback
      const mockIdx = mockMaterials.findIndex(m => m.id === materialId);
      if (mockIdx !== -1) {
        mockMaterials[mockIdx].folderId = folderId;
      }

      notify(t('fileMovedSuccess') || 'File moved successfully', '', 'success');
    } catch (error) {
      console.error('Failed to move material:', error);
      notify(
        t('fileMoveFailed') || 'Failed to move file',
        error.message || t('unknownServerError') || 'Could not move file.',
        'error'
      );
    } finally {
      setMovingMaterial(null);
    }
  };

  const deleteMaterial = (id, type) => {
    if (type === 'folder') {
      const idx = mockFolders.findIndex(f => f.id === id);
      if (idx !== -1) mockFolders.splice(idx, 1);
      // העברת קבצים שהיו בתיקייה לתיקיית האב
      mockMaterials.forEach(m => {
        if (m.folderId === id) m.folderId = null;
      });
    } else {
      const idx = mockMaterials.findIndex(m => m.id === id);
      if (idx !== -1) mockMaterials.splice(idx, 1);
    }
    refreshAllData();
  };

  const deleteMaterialFromServer = async (material) => {
    try {
      await deleteMaterialApi(material.id);
      setMaterials(prev => prev.filter(m => m.id !== material.id));

      const mockIndex = mockMaterials.findIndex(m => m.id === material.id);
      if (mockIndex !== -1) mockMaterials.splice(mockIndex, 1);

      notify(t('fileDeleted') || 'File deleted', '', 'success');
    } catch (error) {
      console.error('Delete failed:', error);
      notify(
        t('error') || 'Error',
        error.message || t('deleteFailed') || 'Failed to delete file',
        'error'
      );
    }
  };

  const deleteFolderFromServer = async (folder) => {
    try {
      const response = await deleteFolder(folder.id);
      const deletedFolderIds = response.deletedFolderIds || [folder.id];
      const deletedMaterialIds = response.deletedMaterialIds || [];

      // Update local states
      setFolders(prev => prev.filter(f => !deletedFolderIds.includes(f.id)));
      setMaterials(prev => prev.filter(m => !deletedMaterialIds.includes(m.id)));

      // Update mock data for backward compatibility / offline fallback
      deletedFolderIds.forEach(id => {
        const mockIdx = mockFolders.findIndex(f => f.id === id);
        if (mockIdx !== -1) mockFolders.splice(mockIdx, 1);
      });
      deletedMaterialIds.forEach(id => {
        const mockIdx = mockMaterials.findIndex(m => m.id === id);
        if (mockIdx !== -1) mockMaterials.splice(mockIdx, 1);
      });

      // If we are currently inside one of the deleted folders, reset view to root
      if (deletedFolderIds.includes(currentFolderId)) {
        setCurrentFolderId(null);
      }

      notify(t('folderDeleted') || 'Folder deleted successfully', '', 'success');
    } catch (error) {
      console.error('Delete folder failed:', error);
      notify(
        t('error') || 'Error',
        error.message || t('folderDeleteFailed') || 'Could not delete folder.',
        'error'
      );
    }
  };

  const promptDeleteMaterial = (material) => {
    const filePath = material.storagePath || material.fileUrl || '';
    const fileMetadata = {
      file_id: material.id,
      file_path: filePath
    };

    setConfirmModal({
      isOpen: true,
      title: t('deleteConfirm') || 'Delete file',
      message: `${t('deleteConfirm')} "${material.fileName || material.id}"`,
      icon: Trash2,
      type: 'danger',
      targetId: material.id,
      targetPath: filePath,
      onConfirm: async () => {
        console.log('Deleting file', fileMetadata);
        await deleteMaterialFromServer(material);
      }
    });
  };

  const promptDeleteFolder = (folder) => {
    setConfirmModal({
      isOpen: true,
      title: t('deleteFolder') || 'Delete folder',
      message: `${t('deleteFolderWarning') || 'Are you sure you want to delete this folder? Deleting it will also delete all files and sub-folders associated with it.'} "${folder.name}"`,
      icon: Trash2,
      type: 'danger',
      targetId: folder.id,
      onConfirm: async () => {
        await deleteFolderFromServer(folder);
      }
    });
  };

  const handleDeleteMaterial = (id, type) => {
    if (type === 'folder') {
      const folder = folders.find(f => f.id === id);
      if (folder) {
        promptDeleteFolder(folder);
      }
    } else {
      const material = materials.find(m => m.id === id);
      if (material) {
        promptDeleteMaterial(material);
      } else {
        // Fallback for mock/local deletion if not found in loaded state
        deleteMaterial(id, type);
      }
    }
  };

  // --- פעולות מפגשים ---
  const handleScheduleMeeting = (e) => {
    e.preventDefault();
    if (!meetingTitle.trim() || !meetingDate || !meetingTime || !auth.currentUser) return;

    const meeting = {
      id: 'meet_' + Math.random().toString(36).substr(2, 9),
      groupId: groupDetails.id,
      title: meetingTitle.trim(),
      startTime: new Date(`${meetingDate}T${meetingTime}`),
      location: meetingLocation.trim() || 'Online',
      creatorId: auth.currentUser.uid,
      createdAt: new Date()
    };

    mockMeetings.push(meeting);
    setMeetingTitle('');
    setMeetingDate('');
    setMeetingTime('');
    setMeetingLocation('');
    refreshAllData();
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim() || !auth.currentUser) return;

    try {
      const newNotice = await createNotice({
        groupId: groupDetails.id,
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

  // --- פעולות חברים והזמנות ---
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

  // חישוב תיקיות וקבצים ברמה הנוכחית
  const getBreadcrumbs = () => {
    const crumbs = [];
    let current = folders.find(f => f.id === currentFolderId);
    while (current) {
      crumbs.unshift(current);
      current = current.parentId ? folders.find(f => f.id === current.parentId) : null;
    }
    return crumbs;
  };

  const currentFolders = folders.filter(f => f.parentId === currentFolderId);
  const currentMaterials = materials.filter(m => m.folderId === currentFolderId);
  const currentFolder = folders.find(f => f.id === currentFolderId);
  const searchActive = searchQuery.trim().length > 0;
  const displayedMaterials = searchActive ? searchResults : currentMaterials;

  if (!isMember) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          {/* Decorative background gradients */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl"></div>

          <button
            onClick={onBack}
            className="absolute top-6 left-6 p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition-all cursor-pointer border border-gray-100"
          >
            <ArrowLeft size={18} className={isRTL ? "rotate-180" : ""} />
          </button>

          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-100 shadow-inner">
            <Lock size={36} className="text-indigo-600 animate-bounce" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight text-center">
            {groupDetails.name}
          </h2>
          <div className="text-center mb-6">
            <span className="text-indigo-600 font-bold text-sm bg-indigo-50/50 px-3 py-1.5 rounded-full inline-block">
              {groupDetails.subject}
            </span>
          </div>

          <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed text-center">
            {t('notAMemberDesc')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleJoinFromDetail}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm cursor-pointer"
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

      {/* כפתור חזרה וכותרת ראשית */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 text-gray-600 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
          </button>
          <div>
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

        {/* כפתורי עזר עליוניים */}
        <div className="flex items-center gap-2">
          <GroupFollowToggle
            groupId={groupDetails.id}
            userId={auth.currentUser?.uid}
            showToast={showToast}
          />

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

      {/* גריד מרכזי המפצל בין התוכן לבין עוזר ה-AI במידה ונפתח */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className={cn("lg:col-span-3 space-y-6", showAiAssistant && "lg:col-span-2")}>

          {/* סרגל ניווט פנימי (Tabs Navbar) */}
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
                    "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer",
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

          {/* --- תוכן טאב 1: צ'אט קבוצתי --- */}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[550px]">
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/40">
                {messages.map(msg => {
                  const isMe = msg.senderId === auth.currentUser?.uid;
                  return (
                    <div key={msg.id} className={cn("flex flex-col max-w-[70%] space-y-1", isMe ? "ml-auto items-end text-right" : "mr-auto items-start text-left")}>
                      <span className="text-[10px] font-bold text-gray-400 px-1">{msg.senderName}</span>
                      <div className={cn("px-4 py-3 rounded-2xl text-sm shadow-sm", isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-100 rounded-tl-none")}>
                        {msg.type === 'audio' ? (
                          <AudioMessagePlayer src={msg.audioUrl} isMe={isMe} />
                        ) : (
                          <p className="leading-relaxed">{msg.text}</p>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 px-1">
                        {format(new Date(msg.createdAt), 'HH:mm')}
                      </span>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* תיבת קלט לצ'אט */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={cn(
                    "p-3 rounded-xl transition-all cursor-pointer border",
                    isRecording
                      ? "bg-red-500 border-red-500 text-white animate-pulse"
                      : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  )}
                >
                  {isRecording ? <Square size={18} /> : <Mic size={18} />}
                </button>
                <input
                  type="text"
                  placeholder={isRecording ? "Recording audio..." : t('typeMessage')}
                  disabled={isRecording}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isRecording}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md disabled:opacity-40 flex items-center justify-center cursor-pointer"
                >
                  <Send size={18} className={isRTL ? "rotate-180" : ""} />
                </button>
              </form>
            </div>
          )}

          {/* --- תוכן טאב 2: חומרי לימוד ותיקיות --- */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              {/* סרגל ניווט עליון בתיקיות (Breadcrumbs) */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-2 text-sm font-bold text-gray-600">
                {currentFolderId === null ? (
                  <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                    {t('materials')}
                  </span>
                ) : (
                  <button
                    onClick={() => setCurrentFolderId(null)}
                    className="hover:text-indigo-600 cursor-pointer transition-colors"
                  >
                    {t('materials')}
                  </button>
                )}

                {getBreadcrumbs().map((crumb, idx, arr) => {
                  const isLast = idx === arr.length - 1;
                  return (
                    <React.Fragment key={crumb.id}>
                      <ChevronRight size={14} className={isRTL ? "rotate-180" : ""} />
                      {isLast ? (
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg truncate max-w-[120px] sm:max-w-[200px]" title={crumb.name}>
                          {crumb.name}
                        </span>
                      ) : (
                        <button
                          onClick={() => setCurrentFolderId(crumb.id)}
                          className="hover:text-indigo-600 cursor-pointer transition-colors truncate max-w-[120px] sm:max-w-[200px] text-left"
                          title={crumb.name}
                        >
                          {crumb.name}
                        </button>
                      )}
                    </React.Fragment>
                  );
                })}

                <button
                  onClick={() => setShowFolderModal(true)}
                  className="ml-auto flex items-center gap-1 text-xs px-3 py-1.5 border border-dashed border-indigo-200 text-indigo-600 rounded-lg bg-indigo-50/30 hover:bg-indigo-50 transition-all cursor-pointer"
                >
                  <FolderPlus size={14} />
                  <span>{t('createFolder')}</span>
                </button>
              </div>

              {/* גריד תיקיות וקבצים נוכחיים */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* צד א: רשימת הפריטים (תיקיות וקבצים) */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2">{t('itemsInside')}</h3>
                      {searchActive && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 p-2 transition-all"
                          aria-label={t('clearSearch')}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <Search size={18} className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                      <input
                        type="text"
                        placeholder={t('searchMaterials')}
                        className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
                          aria-label={t('clearSearch')}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {searchActive && isSearchLoading && (
                    <p className="text-sm text-gray-500 italic py-6 text-center">{t('searchingFiles')}</p>
                  )}

                  {searchActive && !isSearchLoading && displayedMaterials.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-gray-500">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <FileText size={24} className="text-indigo-500" />
                      </div>
                      <p className="font-semibold">{t('noFilesFoundInGroup')}</p>
                      <p className="text-xs">{t('tryAnotherSearch')}</p>
                    </div>
                  )}

                  {!searchActive && currentFolders.length === 0 && currentMaterials.length === 0 && (
                    <p className="text-sm text-gray-400 italic text-center py-8">{t('folderEmpty')}</p>
                  )}

                  {!searchActive && currentFolders.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/70 transition-colors">
                      <button onClick={() => setCurrentFolderId(f.id)} className="flex items-center gap-3 font-bold text-sm text-gray-700 text-left flex-1 cursor-pointer">
                        <FolderIcon size={20} className="text-amber-500 fill-amber-400" />
                        <span>{f.name}</span>
                      </button>
                      <button onClick={() => handleDeleteMaterial(f.id, 'folder')} className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {(searchActive ? displayedMaterials : currentMaterials).map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3 text-left">
                        <FileText size={20} className="text-indigo-500" />
                        <div>
                          <p className="font-bold text-sm text-gray-800">{m.fileName}</p>
                          <p className="text-[10px] text-gray-400">{format(new Date(m.createdAt), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!searchActive && (
                          <div className="relative">
                            <button
                              onClick={() => setMovingMaterial(movingMaterial === m.id ? null : m.id)}
                              className={cn("p-1.5 rounded-lg transition-colors cursor-pointer", movingMaterial === m.id ? "bg-indigo-50 text-indigo-600" : "text-gray-300 hover:text-indigo-600")}
                              title={t('moveToFolder')}
                            >
                              <Move size={16} />
                            </button>

                            {movingMaterial === m.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-20 cursor-default"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMovingMaterial(null);
                                  }}
                                />
                                <div className={cn(
                                  "absolute bg-white border border-gray-100 shadow-2xl rounded-2xl p-3.5 z-30 space-y-2.5 mt-2 w-52 text-left animate-in fade-in slide-in-from-top-1 duration-150",
                                  isRTL ? "left-0" : "right-0"
                                )}>
                                  <p className="text-[10px] font-black uppercase text-gray-400 mb-1 border-b border-gray-50 pb-1.5">{t('moveToFolder') || "Move to:"}</p>

                                  {m.folderId !== null && (
                                    <button
                                      type="button"
                                      onClick={() => handleMoveMaterial(m.id, null)}
                                      className="flex items-center gap-2 w-full text-left text-xs font-bold text-gray-700 hover:text-indigo-600 py-2 px-2.5 hover:bg-indigo-50/50 rounded-xl transition-all cursor-pointer"
                                    >
                                      <span className="text-sm">🏠</span>
                                      <span>{t('backToRoot') || "Root /"}</span>
                                    </button>
                                  )}

                                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                    {folders
                                      .filter(f => f.id !== m.folderId)
                                      .map(f => (
                                        <button
                                          key={f.id}
                                          type="button"
                                          onClick={() => handleMoveMaterial(m.id, f.id)}
                                          className="flex items-center gap-2 w-full text-left text-xs font-semibold text-gray-600 hover:text-indigo-600 py-2 px-2.5 hover:bg-indigo-50/50 rounded-xl transition-all truncate cursor-pointer"
                                        >
                                          <span className="text-sm">📁</span>
                                          <span className="truncate">{f.name}</span>
                                        </button>
                                      ))}
                                    {folders.filter(f => f.id !== m.folderId).length === 0 && m.folderId === null && (
                                      <p className="text-[10px] text-gray-400 italic text-center py-2">No other folders</p>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        <a href={m.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 text-gray-300 hover:text-indigo-600 transition-colors">
                          <Download size={16} />
                        </a>
                        <button onClick={() => promptDeleteMaterial(m)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* צד ב: טופס העלאת חומר לימוד חדש */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2 mb-4 flex items-center gap-2">
                    <Upload size={16} className="text-indigo-600" />
                    {t('uploadMaterial')}
                  </h3>
                  <form onSubmit={handleUploadMaterial} className="space-y-4">
                    <div
                      className={cn(
                        "rounded-3xl border border-dashed p-5 text-center transition-all cursor-pointer",
                        dragActive
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-white"
                      )}
                      onClick={openFilePicker}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleInputFileChange}
                      />
                      <p className="text-sm font-semibold text-gray-700">{selectedFile ? selectedFile.name : 'Drag & drop a file here'}</p>
                      <p className="text-xs text-gray-400 mt-1">or click to browse from your computer</p>
                    </div>

                    {selectedFile ? (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left text-sm text-gray-700 space-y-2">
                        <p className="font-bold text-gray-900">Selected file</p>
                        <p className="text-gray-600 truncate">{selectedFile.name}</p>
                        <button
                          type="button"
                          onClick={clearSelectedFile}
                          className="text-indigo-600 text-xs font-bold hover:underline"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('fileUrl')}</label>
                        <input
                          type="url"
                          placeholder="https://drive.google.com/..."
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          value={newMaterialUrl}
                          onChange={(e) => setNewMaterialUrl(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('fileName')}</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Summary Lesson 4"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={newMaterialName}
                        onChange={(e) => setNewMaterialName(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={uploadingMaterial}
                      className={cn(
                        "w-full py-3 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-100 text-xs cursor-pointer",
                        uploadingMaterial
                          ? "bg-indigo-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      )}
                    >
                      {uploadingMaterial ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </span>
                      ) : (
                        t('share')
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* --- תוכן טאב 3: מפגשים ולוח זמנים --- */}
          {activeTab === 'meetings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* רשימת מפגשים מתוזמנים */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2">{t('upcomingMeetings')}</h3>
                {meetings.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-8">No meetings scheduled yet</p>
                )}
                {meetings.map(meet => (
                  <div key={meet.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-2 text-left">
                    <h4 className="font-bold text-sm text-gray-900">{meet.title}</h4>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1"><Clock size={14} /> {format(new Date(meet.startTime), 'dd/MM/yyyy HH:mm')}</div>
                      <div className="flex items-center gap-1"><MapPin size={14} /> {meet.location}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* טופס קביעת מפגש חדש */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2 mb-4">{t('scheduleMeeting')}</h3>
                <form onSubmit={handleScheduleMeeting} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t('meetingTitle')}</label>
                    <input
                      type="text" required placeholder="e.g. Exam Prep Session"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
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
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{t('location')}</label>
                    <input
                      type="text" placeholder="Zoom, Library, etc. (Default: Online)"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      value={meetingLocation} onChange={(e) => setMeetingLocation(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 text-xs cursor-pointer">
                    {t('schedule')}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* --- תוכן טאב 4: לוח מודעות (Notice Board) --- */}
          {activeTab === 'notices' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* רשימת המודעות הפעילות */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-900">{t('noticeBoard')}</h3>
                {notices.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-8 bg-white rounded-3xl border border-gray-100 shadow-sm">{t('noNoticesYet') || 'No notices posted yet'}</p>
                )}
                {notices.map(notice => (
                  <div key={notice.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2 text-left">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                      <h4 className="font-bold text-sm text-indigo-600">{notice.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-gray-400">{format(new Date(notice.createdAt), 'dd/MM/yyyy')}</span>
                        {auth.currentUser && String(notice.authorId) === String(auth.currentUser.uid) && (
                          <button
                            onClick={() => handleDeleteNotice(notice)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
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

              {/* טופס פרסום מודעה חדשה */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
                <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2 mb-4">{t('postNewNotice') || 'Post New Notice'}</h3>
                <form onSubmit={handlePostNotice} className="space-y-4">
                  <div className="space-y-1">
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
                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center"
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
                    <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                          <Sparkles size={14} className="text-amber-500" />
                          <span>{t('aiSuggestion')}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAcceptSuggestion}
                            className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-sm shadow-amber-100"
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

                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 text-xs cursor-pointer">
                    {t('postUpdate') || 'Post Update'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* --- תוכן טאב 5: שיחת וידאו חיה --- */}
          {activeTab === 'video' && (
            <VideoCall groupId={groupDetails.id} onLeave={() => setActiveTab('chat')} />
          )}

          {/* --- תוכן טאב 6: רשימת חברי הקבוצה וניהול עזיבה --- */}
          {activeTab === 'members' && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto space-y-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <h3 className="text-sm font-black text-gray-900">{t('groupMembers')} ({groupMembers.length})</h3>
                <button
                  onClick={handleLeaveGroup}
                  className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all cursor-pointer"
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
                      <div>
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
            </div>
          )}

        </div>

        {/* פאנל צדדי: עוזר הבינה המלאכותית (נפתח רק במידה וטוגל) */}
        {showAiAssistant && (
          <div className="lg:col-span-1">
            <AIAssistant materials={materials} notices={notices} onClose={() => setShowAiAssistant(false)} />
          </div>
        )}
      </div>

      {/* --- מודאל א: יצירת תיקייה חדשה --- */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full border border-gray-100 shadow-2xl relative">
            <button onClick={() => setShowFolderModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"><X size={18} /></button>
            <h3 className="font-black text-gray-900 text-base mb-4">{t('createFolder')}</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text" required placeholder={t('folderName')}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
              />
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-xs cursor-pointer">
                {t('createFolder')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- מודאל ב: הזמנת משתתפים לקבוצה פרטית --- */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full border border-gray-100 shadow-2xl relative">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"><X size={18} /></button>
            <h3 className="font-black text-gray-900 text-base mb-2">{t('inviteMembers')}</h3>
            <p className="text-xs text-gray-400 mb-4">{t('inviteDesc')}</p>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email" required placeholder={t('emailPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-xs cursor-pointer">
                {t('sendInvite')}
              </button>
            </form>
          </div>
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

// --- קומפוננטת עזר משנית פנימית: נגן הודעות שמע חכם ---
function AudioMessagePlayer({ src, isMe }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  return (
    <div className={cn("flex items-center gap-3 py-1", isMe ? "text-white" : "text-gray-900")}>
      <button
        type="button"
        onClick={togglePlay}
        className={cn("p-2 rounded-full transition-all cursor-pointer", isMe ? "bg-white/20 hover:bg-white/30" : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200")}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>

      <div className="flex flex-col gap-1 min-w-[120px]">
        <audio
          ref={audioRef}
          src={src}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
        <div className="h-1 bg-current opacity-20 rounded-full w-full relative overflow-hidden">
          {isPlaying && <div className="absolute inset-0 bg-current opacity-40 animate-pulse" />}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold opacity-60 uppercase tracking-wider">Audio Memo</span>
          <select
            value={playbackRate}
            onChange={(e) => handleRateChange(Number(e.target.value))}
            className={cn(
              "text-[9px] font-black bg-transparent border-none outline-none cursor-pointer",
              isMe ? "text-white bg-indigo-600" : "text-indigo-600 bg-white"
            )}
          >
            <option value="1" className="text-gray-800">1.0x</option>
            <option value="1.5" className="text-gray-800">1.5x</option>
            <option value="2" className="text-gray-800">2.0x</option>
          </select>
        </div>
      </div>
    </div>
  );
}