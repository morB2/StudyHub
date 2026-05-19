// client/src/components/Toast.jsx
import React from 'react';
import { X, Bell, MessageSquare, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Toast({ toasts, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex gap-4 items-start relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
              {toast.type === 'chat' ? <MessageSquare size={20} /> :
                toast.type === 'meeting' ? <Calendar size={20} /> :
                  <Bell size={20} />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-sm">{toast.title}</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{toast.content}</p>
            </div>
            <button
              onClick={() => onClose(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}