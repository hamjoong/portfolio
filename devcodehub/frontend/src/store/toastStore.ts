import { create } from 'zustand';

interface Toast {
  id: number;
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  showToast: (msg: string) => void;
  removeToast: (id: number) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (msg) => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message: msg }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
