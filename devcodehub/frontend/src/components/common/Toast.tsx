import React from 'react';
import { useToastStore } from '../../store/toastStore';

export const Toast: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-10 z-[99999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className="px-8 py-5 bg-blue-600 text-white font-black rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] animate-in slide-in-from-right-5"
        >
          ✨ {toast.message}
        </div>
      ))}
    </div>
  );
};
