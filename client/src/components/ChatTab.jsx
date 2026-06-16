import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { mockChatMessages } from '../mock/mockData';
import { cn } from '../lib/utils';
import { Send, Mic, Square, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

export default function ChatTab({ groupId, messages, refreshAllData }) {
  const { t, isRTL } = useLanguage();
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    const msg = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      groupId: groupId,
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

  const toggleRecording = () => {
    if (!auth.currentUser) return;
    if (isRecording) {
      // Simulation of voice memo ending
      const audioMsg = {
        id: 'msg_' + Math.random().toString(36).substr(2, 9),
        groupId: groupId,
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || 'Anonymous',
        type: 'audio',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        createdAt: new Date()
      };
      mockChatMessages.push(audioMsg);
      setIsRecording(false);
      refreshAllData();
    } else {
      setIsRecording(true);
    }
  };

  return (
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

      {/* Input box */}
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
  );
}

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
