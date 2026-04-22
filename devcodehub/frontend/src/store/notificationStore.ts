import { create } from 'zustand';

export interface Notification {
  id: number;
  text: string;
  time: string;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (text: string | object) => void; // 인자 타입을 object 포함으로 변경
  setNotifications: (notifications: Notification[]) => void;
  deleteNotificationsByKeyword: (keyword: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (text) => set((state) => {
    // [보안/안정성] text가 객체인 경우 문자열로 강제 변환
    const safeText = typeof text === 'string' ? text : JSON.stringify(text);

    if (state.notifications.length > 0 && state.notifications[0].text === safeText) {
      return state;
    }
    const newNotification = { 
        id: Date.now() + Math.floor(Math.random() * 1000000), 
        text: safeText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    const updated = [newNotification, ...state.notifications].slice(0, 5);
    return { notifications: [...updated] };
  }),
  setNotifications: (notifications) => set({ notifications }),
  deleteNotificationsByKeyword: (keyword) => set((state) => {
    const nextNotifications = state.notifications.filter(n => !n.text.includes(keyword));
    // [Why] 상태가 실제로 변경되었을 때만 업데이트하여 불필요한 렌더링 방지
    if (nextNotifications.length === state.notifications.length) return state;
    return { notifications: nextNotifications };
  }),
}));
