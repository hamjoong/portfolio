import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import axios, { AxiosError } from 'axios';

interface SeniorReview {
  id: number;
  title: string;
  content: string;
  codeContent: string;
  language: string;
  tags: string[];
  credits: number;
  status: string;
  juniorNickname: string;
  juniorLoginId: string;
  seniorNickname: string;
  seniorLoginId: string;
  createdAt: string;
}

interface Application {
  id: number;
  seniorNickname: string;
  seniorLoginId: string;
  message: string;
  createdAt: string;
}

interface ReviewResult {
  id: number;
  content: string;
  rating: number;
  seniorNickname: string;
}

const SeniorReviewDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loginId, role } = useAuthStore();
  const { requireMember } = useAuthGuard();

  const [request, setRequest] = useState<SeniorReview | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);

  // 시니어 지원 폼 상태
  const [applyMessage, setApplyMessage] = useState('');
  // 시니어 리뷰 작성 폼 상태
  const [reviewContent, setReviewContent] = useState('');
  // 주니어 평점 상태
  const [rating, setRating] = useState(5);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await api.get(`/reviews/senior/requests/${id}`);
      setRequest(res.data);

      if (res.data.status === 'COMPLETED') {
        const resultRes = await api.get(`/reviews/senior/requests/${id}/result`);
        setResult(resultRes.data);
      }

      // 지원자 목록 조회 (주니어 본인이거나 시니어인 경우)
      const normalizedRole = role ? role.toUpperCase() : '';
      const isSeniorUser = normalizedRole.includes('SENIOR') || normalizedRole.includes('ADMIN');
      if (res.data.juniorLoginId === loginId || isSeniorUser) {
        const appsRes = await api.get(`/reviews/senior/requests/${id}/applications`);
        setApplications(appsRes.data);
        
        // 시니어가 이미 지원했는지 확인
        if (isSeniorUser) {
          const alreadyApplied = appsRes.data.some((app: Application) => app.seniorLoginId === loginId);
          setIsAlreadyApplied(alreadyApplied);
        }
      }
    } catch (error) {
      console.error('Failed to fetch detail:', error);
    } finally {
      setLoading(false);
    }
  }, [id, loginId, role]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleApply = async () => {
    if (!requireMember('리뷰 지원')) return;
    const normalizedRole = role ? role.toUpperCase() : '';
    const isSeniorUser = normalizedRole.includes('SENIOR') || normalizedRole.includes('ADMIN');
    if (!isSeniorUser) {
      alert('시니어 회원만 지원할 수 있습니다.');
      return;
    }
    if (!applyMessage.trim()) return alert('지원 메시지를 입력해 주세요.');

    try {
      await api.post(`/reviews/senior/requests/${id}/apply`, { message: applyMessage });
      alert('지원이 완료되었습니다.');
      setIsAlreadyApplied(true);
      setApplyMessage('');
      fetchDetail();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{error: {message: string}}>;
        alert(axiosError.response?.data?.error?.message || '지원 중 오류가 발생했습니다.');
      } else {
        alert('지원 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  const handleAccept = async (appId: number) => {
    if (!window.confirm('이 시니어님과 매칭하시겠습니까?')) return;
    try {
      await api.post(`/reviews/senior/requests/${id}/applications/${appId}/accept`);
      alert('매칭이 완료되었습니다. 시니어님의 리뷰를 기다려주세요.');
      fetchDetail();
    } catch {
      alert('매칭 처리 중 오류가 발생했습니다.');
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) return alert('리뷰 내용을 입력해 주세요.');
    try {
      await api.post(`/reviews/senior/requests/${id}/complete`, { content: reviewContent });
      alert('리뷰 작성이 완료되었습니다. 크레딧이 지급되었습니다.');
      fetchDetail();
    } catch {
      alert('리뷰 등록 중 오류가 발생했습니다.');
    }
  };

  const handleRate = async () => {
    try {
      await api.post(`/reviews/senior/requests/${id}/rate`, { rating });
      alert('평점이 등록되었습니다. 감사합니다!');
      fetchDetail();
    } catch {
      alert('평점 등록 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="text-center py-20">로딩 중...</div>;
  if (!request) return <div className="text-center py-20">요청을 찾을 수 없습니다.</div>;

  const isJunior = loginId === request.juniorLoginId;
  const isMatchedSenior = loginId === request.seniorLoginId;
  const normalizedRole = role ? role.toUpperCase() : '';
  const isSeniorUser = normalizedRole.includes('SENIOR') || normalizedRole.includes('ADMIN');

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <header className="mb-10 flex justify-between items-start">
        <div>
          <button onClick={() => navigate('/senior-review')} className="text-slate-400 font-bold mb-4 flex items-center gap-2 hover:text-blue-600 transition-colors bg-transparent border-none cursor-pointer">
            ← 목록으로 돌아가기
          </button>
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-600`}>
              {request.credits} Credits
            </span>
            <span className="text-sm font-bold text-slate-400">{request.language.toUpperCase()}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900">{request.title}</h1>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-400 mb-1">작성자</p>
          <p className="text-lg font-black text-slate-900">{request.juniorNickname}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
        <div className="space-y-10">
          {/* 요청 내용 */}
          <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> 요청 상세 내용
            </h3>
            <div className="text-lg leading-relaxed text-slate-600 whitespace-pre-wrap">{request.content}</div>
          </section>

          {/* 코드 에디터 */}
          <section className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl h-[600px]">
            <div className="px-8 py-4 bg-slate-950 flex justify-between items-center border-b border-white/5">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{request.language} Code</span>
            </div>
            <Editor
              height="calc(100% - 50px)"
              language={request.language}
              theme="vs-dark"
              value={request.codeContent}
              options={{ readOnly: true, fontSize: 14, minimap: { enabled: false }, padding: { top: 20 } }}
            />
          </section>

          {/* 리뷰 결과 (완료 시) */}
          {request.status === 'COMPLETED' && result && (
            <section className="bg-blue-600 p-10 rounded-[2.5rem] shadow-xl shadow-blue-100 text-white">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                🎓 시니어 피드백 도착
              </h3>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-black">Reviewer: {result.seniorNickname}</span>
                  {result.rating > 0 && (
                    <div className="flex gap-1 text-yellow-300 text-xl">
                      {'★'.repeat(result.rating)}{'☆'.repeat(5-result.rating)}
                    </div>
                  )}
                </div>
                <div className="text-lg leading-relaxed whitespace-pre-wrap">{result.content}</div>
              </div>
              
              {isJunior && result.rating === 0 && (
                <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-3xl">
                  <p className="text-slate-900 font-black">피드백이 만족스러우셨나요? 평점을 남겨주세요!</p>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(v => (
                      <button 
                        key={v} 
                        onClick={() => setRating(v)}
                        className={`w-12 h-12 rounded-xl text-xl transition-all ${rating >= v ? 'bg-yellow-400 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <button onClick={handleRate} className="mt-4 px-10 py-3 bg-blue-600 text-white border-none rounded-2xl font-black cursor-pointer shadow-lg">평점 등록하기</button>
                </div>
              )}
            </section>
          )}

          {/* 리뷰 작성 폼 (매칭된 시니어인 경우) */}
          {request.status === 'MATCHED' && isMatchedSenior && (
            <section className="bg-white p-10 rounded-[2.5rem] border-4 border-blue-600 shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 mb-6">전문 리뷰 작성하기</h3>
              <textarea 
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="주니어에게 도움이 될 만한 심도 깊은 피드백을 작성해 주세요."
                className="w-full h-80 p-6 bg-slate-50 border-none rounded-3xl text-lg font-medium outline-none ring-2 ring-transparent focus:ring-blue-100 transition-all mb-6"
              />
              <button onClick={handleSubmitReview} className="w-full py-5 bg-blue-600 text-white border-none rounded-2xl text-xl font-black cursor-pointer shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
                리뷰 완료 및 크레딧 받기
              </button>
            </section>
          )}
        </div>

        <aside className="space-y-8">
          {/* 상태 요약 */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">현재 상태</p>
            <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-black mb-6 ${
              request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
              request.status === 'MATCHED' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
            }`}>
              {request.status}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">지원자 수</span>
                <span className="text-slate-900 font-black">{applications.length}명</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">보상 크레딧</span>
                <span className="text-blue-600 font-black">{request.credits} C</span>
              </div>
            </div>
          </div>

          {/* 주니어: 지원자 목록 */}
          {isJunior && request.status === 'PENDING' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h4 className="text-lg font-black text-slate-900 mb-6">지원자 현황</h4>
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-sm font-medium">아직 지원자가 없습니다.</p>
                ) : (
                  applications.map(app => (
                    <div key={app.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-slate-900">{app.seniorNickname}</span>
                        <button onClick={() => handleAccept(app.id)} className="px-3 py-1 bg-blue-600 text-white border-none rounded-lg text-xs font-bold cursor-pointer">매칭</button>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{app.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 시니어: 지원하기 폼 */}
          {!isJunior && isSeniorUser && request.status === 'PENDING' && !isAlreadyApplied && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-lg font-black text-slate-900">리뷰 지원하기</h4>
              <textarea 
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                placeholder="본인의 강점과 리뷰 방향을 적어주세요."
                className="w-full h-32 p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none"
              />
              <button onClick={handleApply} className="w-full py-4 bg-blue-600 text-white border-none rounded-2xl text-base font-black cursor-pointer shadow-lg shadow-blue-100 hover:bg-blue-700">지원서 제출</button>
            </div>
          )}
          
          {!isJunior && isAlreadyApplied && (
            <div className="bg-green-50 p-8 rounded-[2.5rem] border border-green-100 text-center">
              <p className="text-green-700 font-black">이미 지원한 요청입니다.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default SeniorReviewDetailPage;
