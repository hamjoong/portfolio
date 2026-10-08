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

const TOAST_DURATION_MS = 5000;

// [Why] id가 겹치지 않도록 증가 카운터를 쓰고, 수동으로 닫은 토스트의 타이머도 정리한다.
let nextId = 1;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (msg) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, message: msg }] }));
    timers.set(
      id,
      setTimeout(() => {
        timers.delete(id);
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, TOAST_DURATION_MS),
    );
  },
  removeToast: (id) => {
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
