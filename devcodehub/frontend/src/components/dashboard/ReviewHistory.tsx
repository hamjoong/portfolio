import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import ReviewResultCard, { type StructuredReview } from '../../pages/review/ReviewResultCard';

interface HistoryItem {
  id: number;
  title: string;
  language: string;
  modelName: string;
  result: StructuredReview | null;
  createdAt: string;
}

interface HistoryPage {
  content: HistoryItem[];
  totalPages: number;
}

/**
 * [Why] 지난 AI 리뷰를 다시 보려고 같은 코드를 재요청(크레딧·무료 한도 소모)하지 않도록 이력을 보여 준다.
 */
export const ReviewHistory: React.FC = () => {
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<HistoryPage>({
    queryKey: ['review-history', page],
    queryFn: async () => (await api.get(`/reviews/history?page=${page}&size=5`)).data,
  });

  const items = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <section className="bg-white p-5 sm:p-10 rounded-3xl border border-slate-200 mt-6 xl:mt-10">
      <h3 className="text-xl font-bold m-0 text-slate-900 mb-6">내 AI 리뷰 이력</h3>

      {isLoading ? (
        <p className="text-slate-400 font-bold text-center py-10">로딩 중</p>
      ) : items.length === 0 ? (
        <p className="text-slate-400 font-bold text-center py-10">아직 받은 AI 리뷰가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3 list-none p-0 m-0">
          {items.map(item => (
            <li key={item.id} className="border border-slate-100 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="w-full px-6 py-4 flex items-center justify-between gap-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border-none text-left"
              >
                <span className="font-black text-slate-900 truncate">{item.title}</span>
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                  {item.modelName} · {item.language} · {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </button>
              {openId === item.id && Array.isArray(item.result?.pros) && Array.isArray(item.result?.cons) && (
                <div className="p-4">
                  <ReviewResultCard displayName={item.modelName} data={item.result as StructuredReview} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-30 cursor-pointer"
          >
            이전
          </button>
          <span className="text-sm font-bold text-slate-500">{page + 1} / {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-30 cursor-pointer"
          >
            다음
          </button>
        </div>
      )}
    </section>
  );
};
