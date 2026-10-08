import { create } from 'zustand';

export interface ChatMessage {
  id: number;
  roomId: number;
  senderLoginId: string;
  senderNickname: string;
  message: string;
  type: 'TALK';
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
    
    // [Why] 같은 내용을 연속으로 보낸 정상 메시지까지 지우지 않도록 서버가 준 메시지 id로만 중복을 판단한다.
    const isDuplicate = existingMessages.some((m) => m.id === message.id);

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
