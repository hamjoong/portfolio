import React from 'react';
import { useToastStore, type ToastType } from '../../store/toastStore';

const STYLES: Record<ToastType, { box: string; icon: string }> = {
  success: { box: 'bg-emerald-600 shadow-[0_20px_50px_rgba(5,150,105,0.3)]', icon: '✅' },
  error: { box: 'bg-rose-600 shadow-[0_20px_50px_rgba(225,29,72,0.3)]', icon: '⚠️' },
  info: { box: 'bg-blue-600 shadow-[0_20px_50px_rgba(37,99,235,0.3)]', icon: '✨' },
};

export const Toast: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    // [Why] aria-live로 스크린리더가 알림을 읽도록 하고, 좁은 화면에서는 가로 여백을 줄여 넘치지 않게 한다.
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 right-4 left-4 sm:left-auto sm:right-10 z-[99999] flex flex-col gap-3"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-6 py-4 sm:px-8 sm:py-5 text-white font-black rounded-3xl animate-in slide-in-from-right-5 ${STYLES[toast.type].box}`}
        >
          {STYLES[toast.type].icon} {toast.message}
        </div>
      ))}
    </div>
  );
};
