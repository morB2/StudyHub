// client/src/components/ConfirmModal.jsx
import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, icon: Icon = HelpCircle, confirmText, cancelText, type = 'danger' }) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const confirmBtnBg = type === 'danger' 
    ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500' 
    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white p-6 rounded-3xl max-w-sm w-full border border-gray-100 shadow-2xl relative animate-slide-up">
        {/* Close button */}
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-all border-none bg-transparent"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${type === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
            <Icon size={28} />
          </div>
          <h3 className="font-black text-gray-900 text-lg mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed px-2 mb-6">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all text-xs cursor-pointer bg-white"
          >
            {cancelText || t('cancel') || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 text-white font-bold rounded-xl transition-all text-xs cursor-pointer shadow-md ${confirmBtnBg} border-none`}
          >
            {confirmText || t('accept') || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
