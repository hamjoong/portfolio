import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

interface BoardPreview {
  id: number;
  title: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, guestLogin } = useAuthStore();
  const [skillBoards, setSkillBoards] = useState<BoardPreview[]>([]);
  const [aiBoards, setAiBoards] = useState<BoardPreview[]>([]);
  const [popularReviews, setPopularReviews] = useState<BoardPreview[]>([]);

  useEffect(() => {
    /** [Why] 홈 화면 로딩 속도 최적화를 위해 최신 게시글과 리뷰 목록을 최소한의 데이터(3건)만 요청하여 렌더링함. */
    const fetchPreviews = async () => {
      try {
        const skillRes = await api.get('/boards?type=SKILL&size=3&sort=createdAt,desc');
        if (skillRes.data && Array.isArray(skillRes.data.content)) {
          setSkillBoards(skillRes.data.content);
        }

        const aiRes = await api.get('/boards?type=AI&size=3&sort=createdAt,desc');
        if (aiRes.data && Array.isArray(aiRes.data.content)) {
          setAiBoards(aiRes.data.content);
        }

        const reviewRes = await api.get('/reviews/senior/requests?size=3&sort=createdAt,desc');
        if (reviewRes.data && Array.isArray(reviewRes.data.content)) {
          setPopularReviews(reviewRes.data.content);
        }
      } catch (error) {
        console.error('Failed to fetch home previews:', error);
      }
    };
    fetchPreviews();
  }, []);

  /**
   * [Why] 
   * - 사용자 접근성을 높이기 위해 비로그인 상태에서 서비스 클릭 시 게스트 모드로 자동 전환함.
   * - 보안이 중요한 기능은 게스트 모드 진입 시 알럿을 통해 명시적으로 안내함.
   */
  const handleProtectedNavigate = (path: string) => {
    if (!isLoggedIn) {
      guestLogin();
      alert('방문자 모드로 입장합니다. 일부 기능이 제한될 수 있습니다.');
    }
    navigate(path);
  };

  /** [Why] 상세 가입 절차 없이 대시보드를 둘러보고 싶은 사용자를 위한 편의 기능을 제공함. */
  const handleGuestEntry = () => {
    guestLogin();
    alert('방문자 모드로 입장합니다. 일부 기능이 제한될 수 있습니다.');
    navigate('/dashboard');
  };

  return (
    <div className="w-full pb-20 space-y-12">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row justify-between items-center py-20 gap-12 relative overflow-hidden">
        <div className="flex-1 z-10">
          <h1 className="text-5xl font-black leading-tight mb-8 text-slate-900">
            성장하는 개발자를 위한 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">실전 코드 리뷰</span> 허브
          </h1>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed font-medium">
            현업 시니어와 AI가 당신의 코드를 정밀 진단합니다. <br />
            품질 높은 리뷰를 통해 주니어에서 시니어로 함께 도약하세요.
          </p>
          <div className="flex gap-5">
            <button 
              onClick={() => handleProtectedNavigate('/ai-review')} 
              className="px-10 py-4.5 bg-blue-600 text-white rounded-2xl text-lg font-black cursor-pointer shadow-xl shadow-blue-100 hover:shadow-2xl hover:-translate-y-1 transition-all whitespace-nowrap"
            >
              AI 리뷰 무료 체험
            </button>
            <button 
              onClick={handleGuestEntry} 
              className="px-10 py-4.5 bg-white/80 text-blue-600 border-2 border-blue-600/30 rounded-2xl text-lg font-black cursor-pointer hover:bg-blue-50 transition-all whitespace-nowrap backdrop-blur-sm"
            >
              비회원으로 둘러보기
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center relative">
          <div className="absolute w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <img 
            src="/assets/hero-abstract.png" 
            alt="Hero Abstract" 
            className="w-full max-w-lg rounded-[3rem] shadow-2xl animate-float"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* 최신 IT 지식 */}
        <div className="glass-card glass-glow p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all border border-white/20">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">📚 최신 IT 지식</h3>
            <span 
              onClick={() => handleProtectedNavigate('/boards/skill')}
              className="text-sm text-blue-600 font-black cursor-pointer hover:underline bg-white/50 px-4 py-2 rounded-full border border-white/30 backdrop-blur-md"
            >
              전체보기
            </span>
          </div>
          <ul className="space-y-2">
            {skillBoards.length > 0 ? skillBoards.map((item, idx) => (
              <li 
                key={item.id} 
                onClick={() => handleProtectedNavigate(`/boards/${item.id}`)}
                className="group p-4 rounded-2xl hover:bg-white/30 text-slate-700 text-sm font-bold cursor-pointer transition-all flex items-center border border-transparent hover:border-white/40"
              >
                <span className="text-blue-500 font-black mr-4 w-6">0{idx + 1}</span>
                <span className="truncate group-hover:text-blue-600 transition-colors">{item.title}</span>
              </li>
            )) : <li className="py-10 text-center text-slate-400 text-sm italic font-medium">등록된 게시물이 없습니다.</li>}
          </ul>
        </div>

        {/* 최신 AI 정보 */}
        <div className="glass-card glass-glow p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all border border-white/20">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">🤖 최신 AI 정보</h3>
            <span 
              onClick={() => handleProtectedNavigate('/boards/ai')}
              className="text-sm text-indigo-600 font-black cursor-pointer hover:underline bg-white/50 px-4 py-2 rounded-full border border-white/30 backdrop-blur-md"
            >
              전체보기
            </span>
          </div>
          <ul className="space-y-2">
            {aiBoards.length > 0 ? aiBoards.map((item, idx) => (
              <li 
                key={item.id} 
                onClick={() => handleProtectedNavigate(`/boards/${item.id}`)}
                className="group p-4 rounded-2xl hover:bg-white/30 text-slate-700 text-sm font-bold cursor-pointer transition-all flex items-center border border-transparent hover:border-white/40"
              >
                <span className="text-indigo-500 font-black mr-4 w-6">0{idx + 1}</span>
                <span className="truncate group-hover:text-indigo-600 transition-colors">{item.title}</span>
              </li>
            )) : <li className="py-10 text-center text-slate-400 text-sm italic font-medium">등록된 게시물이 없습니다.</li>}
          </ul>
        </div>
      </div>

      {/* 인기 코드 리뷰 (하단 섹션) */}
      <div className="pt-4">
        <div className="glass-card glass-glow p-10 rounded-[3rem] shadow-xl border border-white/20">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                🔥 인기 시니어 리뷰
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-1">커뮤니티에서 가장 주목받는 실전 리뷰 목록입니다.</p>
            </div>
            <span 
              onClick={() => handleProtectedNavigate('/senior-review')}
              className="text-sm text-blue-600 font-black cursor-pointer hover:underline bg-blue-50 px-5 py-2.5 rounded-full"
            >
              리뷰 탐색하기
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {popularReviews.length > 0 ? popularReviews.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleProtectedNavigate(`/senior-review/${item.id}`)}
                className="group p-8 bg-white/40 rounded-[2rem] cursor-pointer hover:bg-white/80 transition-all border border-transparent hover:border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full uppercase tracking-tighter">HOT</span>
                  <div className="h-[2px] w-8 bg-blue-100"></div>
                </div>
                <h4 className="text-lg font-black text-slate-900 line-clamp-2 leading-tight h-14 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-black text-blue-600/60 uppercase tracking-widest group-hover:text-blue-600">자세히 보기 →</span>
                </div>
              </div>
            )) : <p className="col-span-3 py-20 text-center text-slate-400 text-sm font-medium italic">진행 중인 인기 리뷰가 없습니다.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
