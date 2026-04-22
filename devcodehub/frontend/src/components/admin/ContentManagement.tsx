import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

interface BoardInfo {
  id: number;
  title: string;
  type: string;
  viewCount: number;
  createdAt: string;
  authorNickname: string;
  authorLoginId: string;
}

const ContentManagement: React.FC = () => {
  const [boards, setBoards] = useState<BoardInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBoards = useCallback(async (page: number, keyword: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/boards?page=${page}&size=10&sort=createdAt,desc&keyword=${keyword}`);
      // 백엔드 Page 객체 응답 처리
      if (res.data && Array.isArray(res.data.content)) {
        setBoards(res.data.content);
        setTotalPages(res.data.totalPages);
        setCurrentPage(page);
      } else {
        setBoards([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      setBoards([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards(0, searchKeyword);
  }, [fetchBoards, searchKeyword]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('이 게시글을 정말 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/admin/boards/${id}`);
      alert('삭제되었습니다.');
      fetchBoards(currentPage, searchKeyword);
    } catch {
      alert('삭제 실패했습니다.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(searchInputValue);
    setCurrentPage(0);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-slate-900">전체 게시글 관리</h3>
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="제목, 작성자 검색" 
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
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">게시글</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">분류</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">작성자</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">조회수</th>
              <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">작성일</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold">로딩 중</td></tr>
            ) : boards.length === 0 ? (
              <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold">게시글이 없습니다.</td></tr>
            ) : (
              boards.map(board => (
                <tr key={board.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 max-w-[300px]">
                    <p className="font-black text-slate-900 truncate">{board.title}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase text-slate-500">{board.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{board.authorNickname}</td>
                  <td className="px-6 py-4 text-center text-slate-400 font-medium">{board.viewCount}</td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400 font-bold">{new Date(board.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDelete(board.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-100 transition-colors"
                    >
                      강제 삭제
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
            onClick={() => fetchBoards(currentPage - 1, searchKeyword)}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-30 hover:bg-slate-50 transition-all cursor-pointer"
          >
            이전
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchBoards(i, searchKeyword)}
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
            onClick={() => fetchBoards(currentPage + 1, searchKeyword)}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-30 hover:bg-slate-50 transition-all cursor-pointer"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
