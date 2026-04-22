import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../../services/api';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import axios, { AxiosError } from 'axios';

const SeniorReviewWritePage: React.FC = () => {
  const navigate = useNavigate();
  const { requireLogin } = useAuthGuard();
  const [userCredits, setUserCredits] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    codeContent: '// 리뷰받을 코드를 입력하세요...',
    language: 'auto',
    tags: '',
    credits: 100
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        const response = await api.get('/users/me');
        setUserCredits(response.data.credits);
      } catch (error) {
        console.error('Failed to fetch user credits:', error);
      }
    };
    fetchUserBalance();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireLogin()) return;

    if (!formData.title.trim() || !formData.content.trim() || !formData.codeContent.trim()) {
      alert('모든 필드를 입력해 주세요.');
      return;
    }

    const currentBalance = userCredits ?? 0;
    if (formData.credits < 100) {
      alert('최소 100 크레딧 이상 설정해야 리뷰 요청이 가능합니다.');
      return;
    }
    
    if (formData.credits > currentBalance) {
      alert(`보유한 크레딧보다 많이 사용할 수 없습니다. (현재 보유: ${currentBalance.toLocaleString()} C)`);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
        credits: Number(formData.credits)
      };

      const response = await api.post('/reviews/senior/requests', payload);
      alert('리뷰 요청이 등록되었습니다.');
      navigate(`/senior-review/${response.data}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{error: {message: string}}>;
        alert(axiosError.response?.data?.error?.message || '리뷰 요청 등록 중 오류가 발생했습니다.');
      } else {
        alert('리뷰 요청 등록 중 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-20">
      <h1 className="text-4xl font-black text-slate-900 mb-10">시니어 리뷰 요청</h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-8">
          <div className="flex flex-col gap-2">
            <label className="text-lg font-black text-slate-700">제목</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="예: 리액트 컴포넌트 최적화 및 구조 리뷰 부탁드립니다."
              className="px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-lg font-bold outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-lg font-black text-slate-700">리뷰 요청 내용</label>
            <textarea 
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="어떤 부분에 대해 중점적으로 피드백을 받고 싶은지 자세히 적어주세요."
              className="px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-base font-medium h-48 outline-none focus:border-blue-600 transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-lg font-black text-slate-700">코드 작성</label>
            <div className="bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-800 h-[500px]">
              <div className="px-6 py-3 bg-slate-950 flex justify-between items-center">
                <select 
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="bg-slate-800 text-slate-300 border-none rounded-xl px-4 py-1.5 text-xs font-black outline-none"
                >
                  <option value="auto">언어 자동 감지</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                </select>
              </div>
              <Editor
                height="100%"
                language={formData.language === 'auto' ? 'javascript' : formData.language}
                theme="vs-dark"
                value={formData.codeContent}
                onChange={(v) => setFormData({...formData, codeContent: v || ''})}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  padding: { top: 20, bottom: 20 }
                }}
              />
            </div>
          </div>
        </div>

        <aside className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest">기술 스택 (태그)</label>
              <input 
                type="text" 
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="React, Spring, DB (쉼표 구분)"
                className="px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest">제공 크레딧</label>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={formData.credits}
                  onChange={(e) => setFormData({...formData, credits: Number(e.target.value)})}
                  className="flex-1 px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-xl font-black text-blue-600 outline-none"
                />
                <span className="font-black text-slate-400">Credits</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">크레딧이 높을수록 우수한 시니어의 참여율이 높아집니다.</p>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-blue-600 text-white border-none rounded-[1.5rem] text-xl font-black cursor-pointer shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {isLoading ? '등록 중...' : '리뷰 요청 등록'}
            </button>
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-4 bg-slate-100 text-slate-500 border-none rounded-[1.5rem] text-base font-black cursor-pointer hover:bg-slate-200 transition-all"
            >
              취소하기
            </button>
          </div>

          <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100">
            <h4 className="text-blue-900 font-black mb-3">💡 리뷰 요청 팁</h4>
            <ul className="text-blue-700 text-sm font-medium space-y-3 pl-4 list-disc">
              <li>코드의 목적과 배경을 명확히 설명해 주세요.</li>
              <li>고민하고 있는 특정 부분이 있다면 콕 집어서 질문해 주세요.</li>
              <li>실행 가능한 최소 단위의 코드를 올리는 것이 좋습니다.</li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default SeniorReviewWritePage;