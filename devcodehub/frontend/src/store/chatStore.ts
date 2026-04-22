import { create } from 'zustand';

export interface ChatMessage {
  id: number;
  roomId: number;
  senderLoginId: string;
  senderNickname: string;
  message: string;
  type: 'ENTER' | 'TALK' | 'LEAVE';
  createdAt: string;
}

export interface ChatRoom {
  id: number;
  name: string;
  type: 'SINGLE' | 'GROUP';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: number | null;
  messages: Record<number, ChatMessage[]>;
  isConnected: boolean;
  setRooms: (rooms: ChatRoom[]) => void;
  setActiveRoomId: (roomId: number | null) => void;
  addMessage: (roomId: number, message: ChatMessage) => void;
  setMessages: (roomId: number, messages: ChatMessage[]) => void;
  setConnected: (status: boolean) => void;
  leaveRoom: (roomId: number) => void;
  updateUnreadCount: (roomId: number, count: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  activeRoomId: null,
  messages: {},
  isConnected: false,
  setRooms: (rooms) => set({ rooms }),
  setActiveRoomId: (roomId) => set({ activeRoomId: roomId }),
  updateUnreadCount: (roomId, count) => set((state) => ({
    rooms: state.rooms.map(r => r.id === roomId ? { ...r, unreadCount: count } : r)
  })),
  addMessage: (roomId, message) => set((state) => {
    const existingMessages = state.messages[roomId] || [];
    
    // 중복 메시지 방지 로직 강화
    const isDuplicate = existingMessages.some(m => {
      // 1. ID가 있으면 ID로 비교
      if (m.id && message.id && m.id === message.id) return true;
      // 2. ID가 없으면 내용, 발송자, 시간을 조합하여 비교 (실시간성 확보)
      return m.message === message.message && 
             m.senderLoginId === message.senderLoginId && 
             Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000;
    });

    if (isDuplicate) return state;
    
    return {
      messages: {
        ...state.messages,
        [roomId]: [...existingMessages, message]
      }
    };
  }),
  setMessages: (roomId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: messages
    }
  })),
  setConnected: (status) => set({ isConnected: status }),
  leaveRoom: (roomId) => set((state) => ({
    rooms: state.rooms.filter(r => r.id !== roomId),
    activeRoomId: state.activeRoomId === roomId ? null : state.activeRoomId,
    messages: { ...state.messages, [roomId]: [] }
  })),
}));
