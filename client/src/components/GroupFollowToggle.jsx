// client/src/components/GroupFollowToggle.jsx
import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { followGroupApi, unfollowGroupApi, fetchFollowedGroupsApi } from '../services/groupService';
import { useLanguage } from '../contexts/LanguageContext';

export default function GroupFollowToggle({ groupId, userId, showToast }) {
  const { t } = useLanguage();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !groupId) {
      setLoading(false);
      return;
    }
    
    const checkFollowStatus = async () => {
      try {
        const followedIds = await fetchFollowedGroupsApi(userId);
        setIsFollowing(followedIds.includes(groupId));
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [groupId, userId]);

  const handleToggleFollow = async (e) => {
    e.stopPropagation(); // Prevent card clicks if placed inside cards
    if (!userId) {
      if (showToast) {
        showToast("Authentication Required", "Please sign in to follow groups", "error");
      }
      return;
    }

    try {
      if (isFollowing) {
        await unfollowGroupApi(groupId, userId);
        setIsFollowing(false);
        if (showToast) {
          showToast(t('unfollowGroup') || "הפסקת מעקב", t('unfollowedGroupDesc') || "הפסקת לעקוב אחר קבוצה זו.", "success");
        }
      } else {
        await followGroupApi(groupId, userId);
        setIsFollowing(true);
        if (showToast) {
          showToast(t('followGroup') || "מעקב אחר קבוצה", t('followedGroupDesc') || "אתה כעת עוקב אחר קבוצה זו לקבלת עדכונים.", "success");
        }
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      if (showToast) {
        showToast(t('error') || "שגיאה", error.message, "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
        <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <button
      onClick={handleToggleFollow}
      className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
        isFollowing
          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 hover:bg-indigo-700"
          : "bg-gray-50 border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
      }`}
      title={isFollowing ? (t('unfollowGroup') || "הפסק לעקוב") : (t('followGroup') || "עקוב אחר עדכונים")}
    >
      {isFollowing ? <Bell size={18} className="fill-white" /> : <BellOff size={18} />}
    </button>
  );
}
