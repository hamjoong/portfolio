import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface UserInfo {
  loginId: string;
  nickname: string;
  profileImageUrl: string | null;
  avatarUrl: string | null;
}

interface CreateChatRoomModalProps {
  onClose: () => void;
  onCreated: (roomId: number) => void;
}

const CreateChatRoomModal: React.FC<CreateChatRoomModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [chatType, setChatType] = useState<'SINGLE' | 'GROUP'>('SINGLE');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchKeyword, setSearchInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsFetchingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.nickname.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    u.loginId.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleUserSelect = (loginId: string, nickname: string) => {
    if (chatType === 'SINGLE') {
      setSelectedUserIds([loginId]);
      if (!name.trim()) {
        setName(`${nickname}님과의 대화`);
      }
    } else {
      setSelectedUserIds(prev => 
        prev.includes(loginId) 
          ? prev.filter(id => id !== loginId) 
          : [...prev, loginId]
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('방 이름을 입력하세요.');
    if (selectedUserIds.length === 0) return alert('대화할 상대를 선택하세요.');

    setIsLoading(true);
    try {
      const response = await api.post('/chats/rooms', {
        name: name.trim(),
        type: chatType,
        participantLoginIds: selectedUserIds
      });
      onCreated(response.data);
    } catch {
      alert('채팅방 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-[3000] flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <h2 className="text-xl font-black text-slate-900">새 채팅방</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </header>
        
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 overflow-hidden">
          {/* 채팅 타입 선택 */}
          <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
            <button
              type="button"
              onClick={() => { setChatType('SINGLE'); setSelectedUserIds([]); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${chatType === 'SINGLE' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              1:1 채팅
            </button>
            <button
              type="button"
              onClick={() => { setChatType('GROUP'); setSelectedUserIds([]); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${chatType === 'GROUP' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              그룹 채팅
            </button>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <label className="text-sm font-bold text-slate-600">방 이름</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="채팅방 이름을 입력하세요"
              className="px-5 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-600 transition-colors"
              required
            />
          </div>
          
          <div className="flex flex-col gap-3 overflow-hidden">
            <label className="text-sm font-bold text-slate-600 shrink-0">
              대화 상대 선택 {selectedUserIds.length > 0 && <span className="text-blue-600">({selectedUserIds.length})</span>}
            </label>
            
            <input 
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchInputValue(e.target.value)}
              placeholder="이름 또는 아이디 검색"
              className="px-5 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 shrink-0"
            />

            <div className="flex-1 overflow-y-auto border-2 border-slate-50 rounded-2xl min-h-[200px]">
              {isFetchingUsers ? (
                <div className="p-10 text-center text-slate-400 text-sm">사용자 정보를 불러오는 중...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-sm">검색 결과가 없습니다.</div>
              ) : (
                filteredUsers.map(user => {
                  const isSelected = selectedUserIds.includes(user.loginId);
                  const profileSrc = user.profileImageUrl || user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nickname}`;
                  
                  return (
                    <div 
                      key={user.loginId}
                      onClick={() => handleUserSelect(user.loginId, user.nickname)}
                      className={`p-4 flex items-center gap-4 cursor-pointer transition-colors border-b border-slate-50 last:border-none ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 shrink-0">
                        <img src={profileSrc} alt={user.nickname} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.nickname}</p>
                        <p className="text-xs text-slate-400 truncate">@{user.loginId}</p>
                      </div>
                      {isSelected && (
                        <span className="text-blue-600 font-black">✓</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading || !name.trim() || selectedUserIds.length === 0}
            className="mt-2 py-4 bg-blue-600 text-white border-none rounded-2xl text-lg font-black cursor-pointer shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all shrink-0"
          >
            {isLoading ? '생성 중...' : '채팅 시작하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateChatRoomModal;
