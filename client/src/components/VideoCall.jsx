import React, { useEffect, useRef, useState, useMemo } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Mic, MicOff, Video, VideoOff, LogOut } from "lucide-react";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

const RemoteVideoPlayer = ({ user }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (user.videoTrack && videoRef.current) {
      user.videoTrack.play(videoRef.current);
    }
    return () => {
      if (user.videoTrack) user.videoTrack.stop();
    };
  }, [user.videoTrack]);

  return <div ref={videoRef} className="w-full h-full bg-slate-800" />;
};

export default function VideoCall({ groupId, groupMembers, onLeave }) {
  const client = useMemo(() => AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }), []);
  const channelName = `group-${groupId}`;

  const [token, setToken] = useState(null);
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  const localVideoRef = useRef(null);
  const localTracksRef = useRef({ video: null, audio: null });

  // 💡 פונקציית עזר למציאת שם המשתמש מתוך רשימת חברי הקבוצה
  const getUserName = (uid) => {
    if (!groupMembers || groupMembers.length === 0) return `משתמש ${uid}`;
    
    // מחפשים את המשתמש לפי id או uid (תלוי במבנה המדויק מהשרת)
    const member = groupMembers.find(m => String(m.id) === String(uid) || String(m.uid) === String(uid));
    return member ? (member.name || member.displayName) : `משתמש ${uid}`;
  };

  // 🔑 1. משיכת הטוקן המאובטחת (מעודכן עם ה-ID של המשתמש)
  useEffect(() => {
    async function fetchToken() {
      try {
        const userToken = localStorage.getItem("studybuddy_token");
        const storedUserString = localStorage.getItem("studybuddy_user");
        
        // חילוץ מזהה המשתמש
        let myUserId = "";
        if (storedUserString) {
          const storedUser = JSON.parse(storedUserString);
          myUserId = storedUser.id;
        }
        
        const res = await fetch(`http://localhost:3001/agora/token?channel=${channelName}`, {
          headers: {
            "Authorization": `Bearer ${userToken}`,
            "X-User-Id": String(myUserId) // 💡 הוספנו את שליחת ה-ID לשרת
          }
        });

        if (!res.ok) {
          throw new Error("Unauthorized or not a group member");
        }

        const data = await res.json();
        setToken(data.token);
      } catch (e) {
        console.error("token error:", e);
        onLeave?.(); 
      }
    }
    fetchToken();
  }, [channelName, onLeave]);

  // 🔥 2. הצטרפות לחדר ושידור
  useEffect(() => {
    if (!token) return;

    const init = async () => {
      // 💡 שליפת ה-ID האמיתי של המשתמש מה-localStorage במקום להגריל מספר
      const storedUserString = localStorage.getItem("studybuddy_user");
      let myUid = Math.floor(Math.random() * 65000) + 1; // גיבוי למקרה שאין משתמש
      
      if (storedUserString) {
        const storedUser = JSON.parse(storedUserString);
        if (storedUser.id) {
          myUid = Number(storedUser.id);
        }
        
      }

      await client.join(APP_ID, channelName, token, myUid);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = { audio: audioTrack, video: videoTrack };

      if (localVideoRef.current) videoTrack.play(localVideoRef.current);

      await client.publish([audioTrack, videoTrack]);
      setJoined(true);
    };

    init();

    const handleWindowClose = () => {
      localTracksRef.current.audio?.close();
      localTracksRef.current.video?.close();
      client.leave();
    };
    window.addEventListener("beforeunload", handleWindowClose);

    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
      handleWindowClose();
    };
  }, [token, client, channelName]);

  // 👀 3. קבלת משתמשים מרוחקים
  useEffect(() => {
    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "audio") user.audioTrack?.play();
      setRemoteUsers(Array.from(client.remoteUsers));
    };

    const handleUserUnpublished = (user, mediaType) => {
      if (mediaType === "audio") user.audioTrack?.stop();
      if (mediaType === "video") user.videoTrack?.stop();
      setRemoteUsers(Array.from(client.remoteUsers));
    };

    const handleUserLeft = () => setRemoteUsers(Array.from(client.remoteUsers));

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-left", handleUserLeft);
    };
  }, [client]);

  const toggleMic = async () => {
    if (localTracksRef.current.audio) {
      await localTracksRef.current.audio.setEnabled(!isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCam = async () => {
    if (localTracksRef.current.video) {
      await localTracksRef.current.video.setEnabled(!isCamOn);
      setIsCamOn(!isCamOn);
    }
  };

  const handleLeave = async () => {
    localTracksRef.current.audio?.close();
    localTracksRef.current.video?.close();
    await client.leave();
    setJoined(false);
    setRemoteUsers([]);
    onLeave?.();
  };

    // פונקציית עזר לעדכון סטטוס הוידאו בשרת
  const updateVideoStatus = async (groupId, isActive) => {
    try {
      const token = localStorage.getItem("studybuddy_token");
      // נניח שיש לך ראוט בשרת שעושה את העדכון הזה
      await fetch(`http://localhost:3001/groups/${groupId}/video-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_video_active: isActive })
      });
    } catch (err) {
      console.error("Failed to update video status", err);
    }
  };

  return (
    <div className="flex flex-col p-6 text-white bg-gray-900 rounded-2xl h-[600px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Group Call: {groupId}</h2>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 auto-rows-fr">
        {/* המצלמה המקומית */}
        <div className="relative bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800">
          <div ref={localVideoRef} className={`w-full h-full ${!isCamOn && 'hidden'}`} />
          {!isCamOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <span className="text-gray-400">מצלמה כבויה</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-sm">
            את/ה {isMicOn ? '' : '(מושתק)'}
          </div>
        </div>

        {/* משתמשים מרוחקים */}
        {remoteUsers.map((user) => (
          <div key={user.uid} className="relative bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800">
            {user.hasVideo ? (
              <RemoteVideoPlayer user={user} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <span className="text-gray-400">ללא מצלמה</span>
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-sm flex items-center gap-2">
              <span>{getUserName(user.uid)}</span>
              {!user.hasAudio && <MicOff size={14} className="text-red-400" />}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-colors ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <button
          onClick={toggleCam}
          className={`p-4 rounded-full transition-colors ${isCamOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
        >
          {isCamOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>

        <button
          onClick={handleLeave}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors ml-4"
        >
          <LogOut size={24} />
        </button>
      </div>
    </div>
  );
}