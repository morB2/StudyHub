import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { cn } from '../lib/utils';
import { Send, Mic, Square } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabaseClient';

// הוספנו את groupMembers ל-Props
export default function ChatTab({ groupId, groupMembers = [] }) { 
  const { t, isRTL } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // משתנים עבור ההקלטה
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (!groupId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (!error) setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase
      .channel(`public:messages:group_${groupId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` },
        (payload) => setMessages((prev) => [...prev, payload.new])
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [groupId]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    const contentToSave = newMessage.trim();
    setNewMessage('');

    await supabase.from('messages').insert({
      group_id: groupId,
      user_id: auth.currentUser.uid,
      content: contentToSave,
    });
  };

  // פונקציית ההקלטה וההעלאה
  const toggleRecording = async () => {
    if (isRecording) {
      // עצירת ההקלטה
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // התחלת הקלטה
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          // יצירת קובץ השמע
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          
          // כיבוי נורית המיקרופון בדפדפן
          stream.getTracks().forEach(track => track.stop());

          const fileName = `group_${groupId}_${Date.now()}.webm`;

          // 1. העלאה ל-Storage
          const { error: uploadError } = await supabase.storage
            .from('chat_audio')
            .upload(fileName, audioBlob);

          if (uploadError) {
            console.error("Upload failed:", uploadError);
            return;
          }

          // 2. קבלת הלינק הפומבי
          const { data: publicUrlData } = supabase.storage
            .from('chat_audio')
            .getPublicUrl(fileName);

          // 3. שמירה בטבלת ההודעות
          await supabase.from('messages').insert({
            group_id: groupId,
            user_id: auth.currentUser.uid,
            content: '🎤 הודעה קולית',
            audio_url: publicUrlData.publicUrl // שמירת הלינק לעמודה החדשה
          });
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Mic access denied:", err);
        alert("יש לאשר גישה למיקרופון כדי להקליט.");
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[550px]">
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/40">
        {messages.map((msg) => {
          const isMe = String(msg.user_id) === String(auth.currentUser?.uid);
          
          // שליפת שם המשתמש מתוך המערך שהעברנו מ-GroupDetail
          const sender = groupMembers.find(m => String(m.uid) === String(msg.user_id));
          const displayName = isMe ? 'אני' : (sender?.displayName || `משתמש ${msg.user_id}`);
          
          return (
            <div key={msg.id} className={cn("flex flex-col max-w-[70%] space-y-1", isMe ? "ml-auto items-end text-right" : "mr-auto items-start text-left")}>
              <span className="text-[10px] font-bold text-gray-400 px-1">
                {displayName}
              </span>
              
              <div className={cn("px-4 py-3 rounded-2xl text-sm shadow-sm", isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-100 rounded-tl-none")}>
                {/* אם יש הודעה קולית, נציג נגן אודיו. אחרת, נציג את הטקסט */}
                {msg.audio_url ? (
                  <audio controls src={msg.audio_url} className="max-w-full h-10 mt-1 outline-none" />
                ) : (
                  <p className="leading-relaxed">{msg.content}</p>
                )}
              </div>
              
              <span className="text-[9px] text-gray-400 px-1">
                {format(new Date(msg.created_at), 'HH:mm')}
              </span>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

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
          placeholder={isRecording ? (isRTL ? "מקליט..." : "Recording...") : t('typeMessage')}
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
  );
}