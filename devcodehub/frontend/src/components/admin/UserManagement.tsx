import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import UserDetailModal from './UserDetailModal';

interface UserInfo {
  id: number;
  loginId: string;
  nickname: string;
  email: string;
  role: string;
  level: number;
  credits: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = useCallback(async (page: number, keyword: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${page}&size=10&sort=createdAt,desc&keyword=${keyword}`);
      if (res.data && Array.isArray(res.data.content)) {
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
        setCurrentPage(page);
      } else {
        setUsers([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(0, searchKeyword);
  }, [fetchUsers, searchKeyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(searchInputValue);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-slate-900">사용자 통합 관리</h3>
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="닉네임, 아이디, 이메일 검색" 
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-blue-600 w-80 transition-all shadow-sm"
          />
          <button type="submit" className="absolute right-5 top-3.5 opacity-30 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none">🔍</button>
        </form>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">사용자</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">이메일</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">역할</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">레벨</th>
              <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">보유 크레딧</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold">로딩 중</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold">사용자가 없습니다.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 max-w-[250px]">
                    <div className="flex flex-col truncate">
                      <span className="font-black text-slate-900 truncate">{user.nickname}</span>
                      <span className="text-xs text-slate-400 font-medium truncate">@{user.loginId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 truncate max-w-[200px]">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 
                      user.role === 'SENIOR' ? 'bg-blue-100 text-blue-600' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-600">LV.{user.level}</td>
                  <td className="px-6 py-4 text-right font-black text-blue-600">{user.credits.toLocaleString()} C</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-black transition-colors"
                    >
                      상세 관리
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button 
            onClick={() => fetchUsers(currentPage - 1, searchKeyword)}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-30 hover:bg-slate-50 transition-all cursor-pointer"
          >
            이전
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchUsers(i, searchKeyword)}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                currentPage === i 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button 
            onClick={() => fetchUsers(currentPage + 1, searchKeyword)}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-30 hover:bg-slate-50 transition-all cursor-pointer"
          >
            다음
          </button>
        </div>
      )}

      {selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onUpdated={() => {
            fetchUsers(currentPage, searchKeyword);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
