import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

interface AdminLog {
  id: number;
  adminNickname: string;
  adminLoginId: string;
  targetUserNickname?: string;
  targetUserLoginId?: string;
  actionType: string;
  actionDescription: string;
  reason: string;
  createdAt: string;
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchLogs = useCallback(async (page: number, keyword: string) => {
    setLoading(true);
    try {
      /** [Why] 백엔드 응답이 Page 객체이므로 res.data.content를 참조해야 함 */
      const res = await api.get(`/admin/logs?page=${page}&size=10&sort=createdAt,desc&keyword=${keyword}`);
      if (res.data && Array.isArray(res.data.content)) {
        setLogs(res.data.content);
        setTotalPages(res.data.totalPages);
        setCurrentPage(page);
      } else {
        setLogs([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(0, searchKeyword);
  }, [fetchLogs, searchKeyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(searchInputValue);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-black text-slate-900">운영 감사 로그</h3>
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="관리자, 대상자 검색" 
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-blue-600 w-80 transition-all shadow-sm"
          />
          <button type="submit" className="absolute right-5 top-3.5 opacity-30 hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none">🔍</button>
        </form>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold">로그 로딩 중</div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold bg-white rounded-3xl border border-dashed border-slate-200">
            기록된 로그가 없습니다.
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6 hover:shadow-md transition-shadow">
              <div className="shrink-0 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xs">
                LOG
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md tracking-wider">
                    {log.actionDescription}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">
                  <span className="text-blue-600">[{log.adminNickname}]</span>님이 
                  {log.targetUserNickname ? <span className="text-slate-900"> [{log.targetUserNickname}]</span> : ' 시스템'}에 대해 조작을 수행했습니다.
                </p>
                <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-100 max-w-full">
                  <p className="text-xs text-slate-500 font-medium leading-relaxed break-words">{log.reason}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button 
            onClick={() => fetchLogs(currentPage - 1, searchKeyword)}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-30 hover:bg-slate-50 transition-all cursor-pointer"
          >
            이전
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchLogs(i, searchKeyword)}
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
            onClick={() => fetchLogs(currentPage + 1, searchKeyword)}
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

export default AdminLogs;
