// client/src/components/AIAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { chatWithAiApi } from '../services/aiService';

export default function AIAssistant({
  groupDetails,
  materials,
  meetings,
  notices,
  groupMembers,
  onClose
}) {
  const { t, isRTL } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Set initial greeting based on availability of materials
  useEffect(() => {
    let greeting = "";
    if (!materials || materials.length === 0) {
      greeting = isRTL
        ? `שלום! אני עוזר ה-AI של קבוצת הלימוד שלכם (${groupDetails?.name || ""}). שים לב שאין כרגע חומרי לימוד בקבוצה זו. במה אוכל לעזור לך ללמוד?`
        : `Hello! I am your AI Study Assistant for "${groupDetails?.name || ""}". Please note that no study materials have been uploaded to this group yet. How can I help you study?`;
    } else {
      greeting = isRTL
        ? `שלום! אני עוזר ה-AI של קבוצת הלימוד שלכם (${groupDetails?.name || ""}). סרקתי את ${materials.length} חומרי הלימוד ו-${notices?.length || 0} המודעות בלוח. במה אוכל לעזור לכם היום?`
        : `Hello! I am your AI Study Assistant for "${groupDetails?.name || ""}". I've scanned your ${materials.length} study materials and ${notices?.length || 0} notices. How can I help you today?`;
    }

    setMessages([
      {
        role: 'assistant',
        content: greeting
      }
    ]);
  }, [materials?.length, notices?.length, isRTL, groupDetails?.name]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const context = {
        name: groupDetails?.name,
        subject: groupDetails?.subject,
        materials,
        meetings,
        notices,
        groupMembers
      };

      const result = await chatWithAiApi(userMessage, context);

      setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (error) {
      console.error("Failed to fetch AI chatbot response:", error);
      
      let systemErrorMsg = "";
      if (error.message === 'ERROR_INAPPROPRIATE_CONTENT' || (error.message && error.message.includes('inappropriate'))) {
        systemErrorMsg = isRTL
          ? "הבקשה שלך נחסמה מכיוון שהיא אינה הולמת או שאינה קשור לפעילות קבוצת הלימוד."
          : "Your request was blocked because it is inappropriate or unrelated to study group activities.";
      } else if (error.message === 'ERROR_AI_OVERLOAD' || error.status === 503) {
        systemErrorMsg = isRTL
          ? "עקב עומס בשרת ה-AI, אנא נסה שוב מאוחר יותר."
          : "Due to heavy AI server load, please try again later.";
      } else {
        systemErrorMsg = isRTL
          ? "נכשלה יצירת קשר עם עוזר ה-AI. אנא נסה שוב."
          : "Failed to connect to the AI Assistant. Please try again.";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: systemErrorMsg, isSystemError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-300 animate-pulse" />
          <span className="font-bold text-sm">{t('aiAssistant' || 'AI Study Assistant')}</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer bg-transparent border-none text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? (isRTL ? 'mr-auto flex-row-reverse' : 'ml-auto flex-row-reverse') : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
              msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-500 text-white'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="space-y-1">
              <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : msg.isSystemError
                    ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-none font-semibold'
                    : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-center gap-2 text-gray-400">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <Bot size={16} className="animate-pulse text-indigo-500" />
            </div>
            <span className="text-xs font-medium italic">{t('aiThinking')}</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex gap-2">
        <input
          type="text"
          placeholder={t('askAI')}
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-md cursor-pointer flex items-center justify-center border-none"
        >
          <Send size={16} className={isRTL ? "rotate-180" : ""} />
        </button>
      </form>
    </div>
  );
}