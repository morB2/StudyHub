// client/src/components/VideoCall.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Video, VideoOff, Mic, MicOff, PhoneOff, User, Sparkles } from 'lucide-react';
import { auth } from '../firebase';

export default function VideoCall({ groupId, onLeave }) {
  const { t, isRTL } = useLanguage();
  const [stream, setStream] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [error, setError] = useState(null);
  
  // מצב המשתתפים המדומים בתוך השיחה
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  
  const userVideoRef = useRef(null);

  useEffect(() => {
    const initLocalStream = async () => {
      try {
        // בקשת גישה למצלמה ומיקרופון אמיתיים כדי להציג את המשתמש
        const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(userStream);
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = userStream;
        }
      } catch (err) {
        console.warn("Camera/Mic access denied or unavailable, using mock avatar for self:", err);
        // לא קורסים - מאפשרים להמשיך עם אוואטר מדומה למשתמש
      }
    };

    initLocalStream();

    // סימולציה: חברי קבוצה נוספים מצטרפים לשיחה בהדרגה לאחר שנייה ושלוש שניות
    const timers = [
      setTimeout(() => {
        setRemoteParticipants(prev => [
          ...prev, 
          { id: 'user_b', name: 'Noam Cohen', avatarColor: 'bg-emerald-500', video: true, audio: true }
        ]);
      }, 1200),
      
      setTimeout(() => {
        setRemoteParticipants(prev => [
          ...prev, 
          { id: 'user_c', name: 'Maya Levi', avatarColor: 'bg-amber-500', video: false, audio: true }
        ]);
      }, 3000)
    ];

    return () => {
      // ניקוי המדיה בעת עזיבת המסך
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      timers.forEach(clearTimeout);
    };
  }, []);

  // שליטה בהפעלת/כיבוי המצלמה המקומית
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !videoEnabled;
    }
    setVideoEnabled(!videoEnabled);
  };

  // שליטה בהפעלת/כיבוי המיקרופון המקומי
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = !audioEnabled;
    }
    setAudioEnabled(!audioEnabled);
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-3xl overflow-hidden relative shadow-2xl border border-gray-800 animate-fade-in text-white">
      
      {/* Top Header info */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-gray-800/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-200">
            {isRTL ? 'שיחת וידאו חיה' : 'Live Session'}
          </span>
        </div>
        <div className="bg-gray-800/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold text-gray-300">
          {remoteParticipants.length + 1} {isRTL ? 'משתתפים' : 'Connected'}
        </div>
      </div>

      {/* Video Grid Area */}
      <div className="flex-1 p-6 pt-20 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-950 overflow-y-auto">
        
        {/* 1. Local User Container */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden relative border border-white/5 shadow-inner min-h-[180px] flex items-center justify-center">
          {videoEnabled && stream ? (
            <video 
              ref={userVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover scale-x-[-1]" 
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold border-2 border-indigo-400 shadow-lg">
                {auth.currentUser?.displayName?.[0] || 'U'}
              </div>
              <span className="text-xs font-medium text-gray-400">
                {videoEnabled ? (isRTL ? 'טוען וידאו...' : 'Connecting Media...') : (isRTL ? 'מצלמה כבויה' : 'Camera Off')}
              </span>
            </div>
          )}
          
          {/* Label Tag */}
          <div className="absolute bottom-3 left-3 bg-gray-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <span>{auth.currentUser?.displayName || 'You'} ({isRTL ? 'אני' : 'Me'})</span>
            {!audioEnabled && <MicOff size={12} className="text-red-400" />}
          </div>
        </div>

        {/* 2. Simulated Remote Participants */}
        {remoteParticipants.map(participant => (
          <div 
            key={participant.id} 
            className="bg-gray-800 rounded-2xl overflow-hidden relative border border-white/5 min-h-[180px] flex items-center justify-center animate-fade-in"
          >
            {participant.video ? (
              // הדמיית תמונת וידאו נעה של משתמש קצה בעזרת רקע ויזואלי דינמי
              <div className={`w-full h-full ${participant.avatarColor} opacity-20 flex items-center justify-center`}>
                <Sparkles size={40} className="animate-spin text-white opacity-40" style={{ animationDuration: '6s' }} />
              </div>
            ) : null}

            {/* Avatar Central View if video is off */}
            {!participant.video && (
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-full ${participant.avatarColor} flex items-center justify-center text-xl font-bold shadow-lg`}>
                  {participant.name[0]}
                </div>
                <span className="text-xs font-medium text-gray-400">
                  {isRTL ? 'מצלמה כבויה' : 'Camera Off'}
                </span>
              </div>
            )}

            {/* Label Tag */}
            <div className="absolute bottom-3 left-3 bg-gray-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <span>{participant.name}</span>
              {!participant.audio && <MicOff size={12} className="text-red-400" />}
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar Actions */}
      <div className="p-6 bg-gray-900 border-t border-white/5 flex items-center justify-center gap-4">
        {/* Toggle Audio */}
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-2xl transition-all cursor-pointer border ${
            audioEnabled 
              ? 'bg-gray-800 border-white/10 text-white hover:bg-gray-700' 
              : 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
          }`}
          title={audioEnabled ? 'Mute Mic' : 'Unmute Mic'}
        >
          {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {/* Toggle Video */}
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-2xl transition-all cursor-pointer border ${
            videoEnabled 
              ? 'bg-gray-800 border-white/10 text-white hover:bg-gray-700' 
              : 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
          }`}
          title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        <div className="w-px h-8 bg-white/10 mx-2" />

        {/* Leave Session Button */}
        <button
          onClick={onLeave}
          className="p-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 hover:scale-105 transition-all shadow-lg shadow-red-900/30 flex items-center gap-2 font-bold text-sm cursor-pointer"
        >
          <PhoneOff size={20} />
          <span className="hidden sm:inline">{isRTL ? 'נתק שיחה' : 'Leave Call'}</span>
        </button>
      </div>

    </div>
  );
}