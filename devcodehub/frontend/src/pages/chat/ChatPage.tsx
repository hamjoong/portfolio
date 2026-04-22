import React, { useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore, type ChatMessage } from '../../store/chatStore';
import { useShallow } from 'zustand/react/shallow';
import { stompClient } from '../../services/stompClient';
import api from '../../services/api';
import ChatRoomList from '../../components/chat/ChatRoomList';
import ChatWindow from '../../components/chat/ChatWindow';

const ChatPage: React.FC = () => {
  const { accessToken, isLoggedIn, role, loginId } = useAuthStore(useShallow((state) => ({
    accessToken: state.accessToken,
    isLoggedIn: state.isLoggedIn,
    role: state.role,
    loginId: state.loginId
  })));
  
  const { setRooms, activeRoomId, addMessage, isConnected, updateUnreadCount } = useChatStore(useShallow((state) => ({
    setRooms: state.setRooms,
    activeRoomId: state.activeRoomId,
    addMessage: state.addMessage,
    isConnected: state.isConnected,
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

  // [Why] 전역 연결은 App.tsx에서 관리하므로 ChatPage에서는 연결 상태 확인 및 데이터 페칭에만 집중함.
  useEffect(() => {
    if (!isLoggedIn || !accessToken || role === 'GUEST') {
      return;
    }
    
    // 이미 App.tsx에서 connect 되었으므로 여기서는 구독 준비를 위해 idempotent하게 호출 가능
    stompClient.connect(accessToken);
    fetchRooms();
  }, [isLoggedIn, accessToken, role, fetchRooms]);

  // 구독 제어 (메시지 + 카운트)
  useEffect(() => {
    if (!isConnected || !loginId) return;

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
      // [Why] DEPLOYMENT.md 준수: 페이지 이동 시 구독을 명시적으로 해제하여 리소스 유출 및 에러 로그 방지
      if (activeRoomId) stompClient.unsubscribe(`/sub/chat/room/${activeRoomId}`);
      stompClient.unsubscribe(`/sub/chat/unread/${loginId}`);
    };
  }, [isConnected, activeRoomId, loginId, addMessage, updateUnreadCount]);

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