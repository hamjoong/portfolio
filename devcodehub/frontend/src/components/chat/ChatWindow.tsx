import React, { useEffect, useRef, useMemo } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { stompClient } from '../../services/stompClient';
import api from '../../services/api';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

const ChatWindow: React.FC = () => {
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const messages = useChatStore((state) => state.messages);
  const activeRoom = useChatStore((state) => state.rooms.find(r => r.id === activeRoomId));
  const setMessages = useChatStore((state) => state.setMessages);
  const loginId = useAuthStore((state) => state.loginId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentMessages = useMemo(() => 
    activeRoomId ? messages[activeRoomId] || [] : [], 
    [activeRoomId, messages]
  );

  useEffect(() => {
    if (!activeRoomId) return;

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/chats/rooms/${activeRoomId}/messages`);
        // 백엔드 Page 객체에서 content 추출 및 역순 정렬 (최신이 아래로)
        const history = [...response.data.content].reverse();
        setMessages(activeRoomId, history);
        
        // 읽음 처리 알림
        const lastMessage = history[history.length - 1];
        await api.patch(`/chats/rooms/${activeRoomId}/read`, { messageId: lastMessage?.id || 0 });
      } catch {
        console.error('Failed to fetch chat history');
      }
    };

    fetchHistory();
  }, [activeRoomId, setMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages]);

  const handleSendMessage = (text: string) => {
    if (!activeRoomId || !loginId) return;

    stompClient.publish('/pub/chat/message', {
      roomId: activeRoomId,
      senderLoginId: loginId,
      message: text,
      type: 'TALK'
    });
  };

  if (!activeRoomId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/30">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-6">💬</div>
        <h2 className="text-xl font-black text-slate-900 mb-2">대화를 시작해보세요</h2>
        <p className="text-slate-500 font-medium">왼쪽 목록에서 채팅방을 선택하거나 새로운 방을 만드세요.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-sm z-10">
        <div>
          <h2 className="text-lg font-black text-slate-900">{activeRoom?.name}</h2>
          <p className="text-xs text-green-500 font-bold flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> 실시간 연결됨
          </p>
        </div>
        <button 
          onClick={async () => {
            if (window.confirm('정말 이 채팅방을 나가시겠습니까?')) {
              try {
                await api.delete(`/chats/rooms/${activeRoomId}/leave`);
                useChatStore.getState().leaveRoom(activeRoomId!);
              } catch (error) {
                  console.error('Leave room failed:', error);
                  alert('채팅방 나가기에 실패했습니다.');
              }            }
          }}
          className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer"
        >
          방 나가기
        </button>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 flex flex-col gap-6"
      >
        {currentMessages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            isMe={msg.senderLoginId === loginId} 
          />
        ))}
      </div>

      <ChatInput onSend={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
