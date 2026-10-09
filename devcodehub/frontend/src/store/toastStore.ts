import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  showToast: (msg: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

const TOAST_DURATION_MS = 5000;

// [Why] id가 겹치지 않도록 증가 카운터를 쓰고, 수동으로 닫은 토스트의 타이머도 정리한다.
let nextId = 1;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (msg, type = 'info') => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, message: msg, type }] }));
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

// [Why] 컴포넌트 밖(훅·이벤트 핸들러)에서도 훅 없이 알림을 띄우기 위한 단축 함수. 브라우저 alert()을 대체한다.
export const toast = {
  success: (msg: string) => useToastStore.getState().showToast(msg, 'success'),
  error: (msg: string) => useToastStore.getState().showToast(msg, 'error'),
  info: (msg: string) => useToastStore.getState().showToast(msg, 'info'),
};
