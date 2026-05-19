// client/src/components/AIAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function AIAssistant({ materials, notices, onClose }) {
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

  // הודעת פתיחה מדומה מה-AI ברגע שהרכיב נפתח
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: isRTL 
          ? `שלום! אני עוזר ה-AI של קבוצת הלימוד שלכם. סרקתי את ${materials.length} חומרי הלימוד ו-${notices.length} המודעות בלוח. במה אוכל לעזור לכם היום?`
          : `Hello! I am your group's AI Study Assistant. I've scanned your ${materials.length} study materials and ${notices.length} notices. How can I help you ace your exams today?`
      }
    ]);
  }, [materials.length, notices.length, isRTL]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // סימולציה של חשיבת הבינה המלאכותית (לוקח שנייה וחצי להגיב)
    setTimeout(() => {
      let aiResponse = "";

      // יצירת תשובות חכמות מבוססות מילים-שמורות (Keywords) כדי שהסימולציה תרגיש אמיתית
      const lowerInput = userMessage.toLowerCase();
      
      if (lowerInput.includes('חומר') || lowerInput.includes('material') || lowerInput.includes('קובץ')) {
        if (materials.length > 0) {
          const filesList = materials.map(m => m.fileName).join(', ');
          aiResponse = isRTL 
            ? `מצאתי בקבוצה את חומרי הלימוד הבאים: ${filesList}. אתם יכולים להוריד אותם ישירות מטאב "חומרי לימוד". מומלץ להתחיל לעבור על הסיכומים המרכזיים!`
            : `I found the following study materials in this group: ${filesList}. You can access and download them in the "Materials" tab.`;
        } else {
          aiResponse = isRTL
            ? "כרגע לא הועלו עדיין חומרי לימוד לקבוצה הזו. אתם יכולים להעלות קבצים בקלות דרך לשונית 'חומרי לימוד'!"
            : "There are no study materials uploaded to this group yet. You can upload files via the 'Materials' tab!";
        }
      } else if (lowerInput.includes('הודע') || lowerInput.includes('notice') || lowerInput.includes('לוח')) {
        if (notices.length > 0) {
          const latestNotice = notices[0];
          aiResponse = isRTL
            ? `המודעה האחרונה בלוח פורסמה על ידי ${latestNotice.authorName} וכותרתה: "${latestNotice.title}". התוכן שלה הוא: "${latestNotice.content}".`
            : `The latest notice on the board is "${latestNotice.title}" by ${latestNotice.authorName}: "${latestNotice.content}".`;
        } else {
          aiResponse = isRTL
            ? "לוח המודעות של הקבוצה ריק כרגע. מנהלי הקבוצה יכולים לפרסם פה עדכונים חשובים או שינויים."
            : "The notice board is currently empty. Group admins can post important updates here.";
        }
      } else if (lowerInput.includes('מבחן') || lowerInput.includes('exam') || lowerInput.includes('עזר')) {
        aiResponse = isRTL
          ? "כדי להתכונן למבחן בצורה הכי טובה, אני ממליץ לכם ליצור פגישת וידאו קבוצתית בלשונית ה-Video, לחלק ביניכם את נושאי הלימוד ולפתור יחד מבחנים משנים קודמות שנמצאים בטאב החומרים."
          : "To prepare for exams, I highly recommend scheduling a team session in the Video tab, dividing topics among members, and solving past exams available in Materials.";
      } else {
        aiResponse = isRTL
          ? `קיבלתי את השאלה שלך: "${userMessage}". כעוזר ה-AI של הקבוצה, אני ממליץ לשתף פעולה עם שאר חברי הלימוד בצ'אט, להעלות סיכומי שיעור ולתאם מפגשי חזרונים ביומן המשותף כדי להגיע לתוצאות מקסימליות!`
          : `I noted your question: "${userMessage}". As your AI assistant, I recommend collaborating with group members in the chat and sharing lecture notes to study effectively!`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setIsLoading(false);
    }, 1500);
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
          className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
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
              <Bot size={16} className="animate-pulse" />
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
          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-md cursor-pointer flex items-center justify-center"
        >
          <Send size={16} className={isRTL ? "rotate-180" : ""} />
        </button>
      </form>
    </div>
  );
}