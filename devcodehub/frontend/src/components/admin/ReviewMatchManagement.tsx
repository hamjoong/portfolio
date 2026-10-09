import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../../services/api';

import { toast } from '../../store/toastStore';
interface MatchInfo {
  id: number;
  title: string;
  credits: number;
  status: 'PENDING' | 'MATCHED' | 'COMPLETED' | 'CANCELED';
  juniorNickname: string;
  seniorNickname: string | null;
  createdAt: string;
}

const STATUS_LABEL: Record<MatchInfo['status'], string> = {
  PENDING: '지원 대기',
  MATCHED: '진행 중',
  COMPLETED: '완료',
  CANCELED: '취소됨',
};

/**
 * [Why] 매칭이 멈추거나 분쟁이 생겼을 때 운영자가 강제로 취소하고 주니어에게 크레딧을 환불하는 화면.
 * 완료·취소된 건은 서버도 거부하므로 버튼을 아예 숨긴다.
 */
const ReviewMatchManagement: React.FC = () => {
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMatches = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/reviews/senior/requests?page=${page}&size=10&sort=createdAt,desc`);
      if (res.data && Array.isArray(res.data.content)) {
        setMatches(res.data.content);
        setTotalPages(res.data.totalPages);
        setCurrentPage(page);
      } else {
        setMatches([]);
        setTotalPages(0);
      }
    } catch {
      setMatches([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches(0);
  }, [fetchMatches]);

  const handleCancel = async (match: MatchInfo) => {
    const reason = window.prompt(
      `'${match.title}' 매칭을 취소하고 ${match.credits.toLocaleString()}C를 환불합니다.\n취소 사유를 입력해 주세요.`,
      '운영자 판단에 의한 취소'
    );
    if (reason === null) return;
    try {
      await api.post(`/admin/reviews/${match.id}/cancel`, { reason });
      toast.success('취소하고 환불했습니다.');
      fetchMatches(currentPage);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error?.message : null;
      toast.error(message || '취소 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h3 className="text-2xl font-black text-slate-900 mb-8">시니어 리뷰 매칭 관리</h3>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">요청</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">주니어 / 시니어</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">크레딧</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">상태</th>
              <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">요청일</th>
              <th className="px-6 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold">로딩 중</td></tr>
            ) : matches.length === 0 ? (
              <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-bold">리뷰 요청이 없습니다.</td></tr>
            ) : (
              matches.map(match => (
                <tr key={match.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 max-w-[260px]">
                    <p className="font-black text-slate-900 truncate">{match.title}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">
                    {match.juniorNickname} / {match.seniorNickname ?? '-'}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 font-bold">{match.credits.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500">{STATUS_LABEL[match.status]}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-400 font-bold">{new Date(match.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                    {(match.status === 'PENDING' || match.status === 'MATCHED') && (
                      <button
                        onClick={() => handleCancel(match)}
                        className="px-4 py-2 bg-red-50 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-100 transition-colors cursor-pointer border-none"
                      >
                        강제 취소·환불
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            onClick={() => fetchMatches(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-30 hover:bg-slate-50 transition-all cursor-pointer"
          >
            이전
          </button>
          <span className="text-sm font-bold text-slate-500">{currentPage + 1} / {totalPages}</span>
          <button
            onClick={() => fetchMatches(currentPage + 1)}
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

export default ReviewMatchManagement;
