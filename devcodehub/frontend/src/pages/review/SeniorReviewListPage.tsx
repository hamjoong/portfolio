import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuthGuard } from '../../hooks/useAuthGuard';

interface SeniorReviewRequest {
  id: number;
  title: string;
  juniorNickname: string;
  credits: number;
  status: string;
  language: string;
  tags: string[];
  applicationCount: number;
  createdAt: string;
}

const SeniorReviewListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isMember } = useAuthGuard();
  
  const currentPage = parseInt(searchParams.get('page') || '0');

  const fetchRequests = async (page: number) => {
    const response = await api.get(`/reviews/senior/requests?page=${page}&size=10&sort=createdAt,desc`);
    return response.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['seniorReviewRequests', currentPage],
    queryFn: () => fetchRequests(currentPage),
  });

  const requests: SeniorReviewRequest[] = data?.content || [];
  const totalPages: number = data?.totalPages || 0;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'MATCHED': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '지원 대기';
      case 'MATCHED': return '진행 중';
      case 'COMPLETED': return '완료';
      default: return status;
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    navigate(`/senior-review?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-20">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">시니어 리뷰 게시판</h1>
          <p className="text-slate-500 font-medium text-lg">전문가와 매칭되어 코드의 깊이를 더해보세요.</p>
        </div>
        {isMember && (
          <button 
            onClick={() => navigate('/senior-review/new')} 
            className="px-8 py-4 bg-blue-600 text-white border-none rounded-2xl font-black cursor-pointer shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            리뷰 요청하기
          </button>
        )}
      </header>

      <div className="flex flex-col gap-5">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400 font-bold">리뷰 요청을 불러오는 중...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">등록된 리뷰 요청이 없습니다.</p>
          </div>
        ) : (
          <>
            {requests.map(req => (
              <div 
                key={req.id} 
                onClick={() => navigate(`/senior-review/${req.id}`)}
                className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${getStatusBadgeClass(req.status)}`}>
                      {getStatusText(req.status)}
                    </span>
                    <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {req.credits} Credits
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{req.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg uppercase">{req.language}</span>
                    {req.tags.map(t => (
                      <span key={t} className="text-sm text-slate-400 font-semibold">#{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center text-sm text-slate-400 font-medium">
                    <span>{req.juniorNickname}</span>
                    <span className="mx-3">|</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    <span className="mx-3">|</span>
                    <span>지원자 {req.applicationCount}명</span>
                  </div>
                </div>
                <div className="text-slate-300 group-hover:text-blue-600 transition-colors text-3xl ml-10">→</div>
              </div>
            ))}

            <div className="flex justify-center items-center gap-2 mt-12">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                이전
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    currentPage === i 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                다음
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SeniorReviewListPage;