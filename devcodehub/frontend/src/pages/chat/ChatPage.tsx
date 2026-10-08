import React, { useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore, type ChatMessage } from '../../store/chatStore';
import { useShallow } from 'zustand/react/shallow';
import { stompClient } from '../../services/stompClient';
import api from '../../services/api';
import ChatRoomList from '../../components/chat/ChatRoomList';
import ChatWindow from '../../components/chat/ChatWindow';

const ChatPage: React.FC = () => {
  const { isLoggedIn, role, loginId } = useAuthStore(useShallow((state) => ({
    isLoggedIn: state.isLoggedIn,
    role: state.role,
    loginId: state.loginId
  })));
  
  const { setRooms, activeRoomId, addMessage, updateUnreadCount } = useChatStore(useShallow((state) => ({
    setRooms: state.setRooms,
    activeRoomId: state.activeRoomId,
    addMessage: state.addMessage,
    updateUnreadCount: state.updateUnreadCount
  })));

  const fetchRooms = useCallback(async () => {
    try {
      const response = await api.get('/chats/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    }
  }, [setRooms]);

  // 채팅방 목록 페칭. 소켓 연결은 App이 관리하므로 여기서는 연결/해제하지 않는다.
  useEffect(() => {
    if (!isLoggedIn || role === 'GUEST') {
      return;
    }
    fetchRooms();
  }, [isLoggedIn, role, fetchRooms]);

  // 구독 제어 (메시지 + 카운트). 구독은 stompClient가 재연결 때 자동 복구한다.
  useEffect(() => {
    if (!loginId || role === 'GUEST') return;

    // 1. 방별 메시지 구독
    if (activeRoomId) {
      stompClient.subscribe(`/sub/chat/room/${activeRoomId}`, (message) => {
        addMessage(activeRoomId, message as unknown as ChatMessage);
      });
    }

    // 2. 미읽음 카운트 구독
    stompClient.subscribe(`/sub/chat/unread/${loginId}`, (data) => {
      const parsedData = data as { roomId: number; unreadCount: number };
      updateUnreadCount(parsedData.roomId, parsedData.unreadCount);
    });

    return () => {
      if (activeRoomId) stompClient.unsubscribe(`/sub/chat/room/${activeRoomId}`);
      stompClient.unsubscribe(`/sub/chat/unread/${loginId}`);
    };
  }, [activeRoomId, loginId, role, addMessage, updateUnreadCount]);

  if (!isLoggedIn || role === 'GUEST') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500 font-bold">로그인이 필요한 서비스입니다.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
      <ChatRoomList />
      <ChatWindow />
    </div>
  );
};

export default ChatPage;