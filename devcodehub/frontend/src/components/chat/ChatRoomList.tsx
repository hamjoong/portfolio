import React, { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useShallow } from 'zustand/react/shallow';
import CreateChatRoomModal from './CreateChatRoomModal';
import api from '../../services/api';

const ChatRoomList: React.FC = () => {
  const { rooms, activeRoomId, setActiveRoomId, setRooms } = useChatStore(useShallow((state) => ({
    rooms: state.rooms,
    activeRoomId: state.activeRoomId,
    setActiveRoomId: state.setActiveRoomId,
    setRooms: state.setRooms
  })));
  const [isModalOpen, setIsEditModalOpen] = useState(false);

  const handleCreated = async (newRoomId: number) => {
    setIsEditModalOpen(false);
    // 방 목록 새로고침
    try {
      const response = await api.get('/chats/rooms');
      setRooms(response.data);
      setActiveRoomId(newRoomId);
    } catch (error) {
      console.error('Failed to refresh rooms:', error);
    }
  };

  return (
    <div className="w-[320px] h-full border-r border-slate-100 flex flex-col bg-slate-50/50">
      <header className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-900">채팅</h2>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold hover:bg-blue-700 transition-colors"
        >
          +
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm font-medium">
            참여 중인 채팅방이 없습니다.
          </div>
        ) : (
          rooms.map(room => (
            <div
              key={room.id}
              onClick={() => setActiveRoomId(room.id)}
              className={`p-5 cursor-pointer transition-colors border-b border-slate-50 flex gap-4 items-start ${
                activeRoomId === room.id ? 'bg-white shadow-sm' : 'hover:bg-slate-100/50'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-black">
                {room.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-black text-slate-900 truncate">{room.name}</h3>
                  <div className="flex items-center gap-2">
                    {room.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {room.unreadCount}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-bold">
                      {room.lastMessageTime ? new Date(room.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">{room.lastMessage}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <CreateChatRoomModal 
          onClose={() => setIsEditModalOpen(false)} 
          onCreated={handleCreated} 
        />
      )}
    </div>
  );
};

export default ChatRoomList;
