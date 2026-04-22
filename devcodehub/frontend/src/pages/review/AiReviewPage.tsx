import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { useShallow } from 'zustand/react/shallow';
import api from '../../services/api';
import axios from 'axios';
import ReviewResultCard, { type StructuredReview } from './ReviewResultCard';
import { useAuthStore } from '../../store/authStore';

loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' } });

const MODEL_NAME_MAPPING: Record<string, string> = {
  'openai': 'OpenAI GPT-4o',
  'claude': 'Claude 3.5 Sonnet',
  'gemini': 'Google Gemini 1.5'
};

const MAX_GUEST_USAGE = 3;

const AiReviewPage: React.FC = () => {
  const { isLoggedIn, role, credits, weeklyFreeReviewUsed, maxWeeklyFreeLimit, updateCredits, setGuestUsage } = useAuthStore(useShallow((state) => ({
    isLoggedIn: state.isLoggedIn,
    role: state.role,
    credits: state.credits,
    weeklyFreeReviewUsed: state.weeklyFreeReviewUsed,
    maxWeeklyFreeLimit: state.maxWeeklyFreeLimit,
    updateCredits: state.updateCredits,
    setGuestUsage: state.setGuestUsage
  })));
  const [code, setCode] = useState('// 리뷰받을 코드를 입력하세요...\n\nfunction helloWorld() {\n  console.log("Hello, DevCodeHub!");\n}');
  const [language, setLanguage] = useState('auto');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini']);
  const [results, setResults] = useState<Record<string, StructuredReview>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && role !== 'GUEST') {
      api.get('/credits/balance').then(res => setActiveSubscription(res.data.plan));
    }
    
    if (!isLoggedIn || role === 'GUEST') {
      api.get('/reviews/ai/guest-usage').then(res => setGuestUsage(res.data));
    }
  }, [isLoggedIn, role, setGuestUsage]);

  const subscriptionAdd = activeSubscription === 'WEEKLY' ? 10 : activeSubscription === 'MONTHLY' ? 30 : activeSubscription === 'YEARLY' ? 100 : 0;
  const currentMaxLimit = isLoggedIn && role !== 'GUEST' ? (maxWeeklyFreeLimit + subscriptionAdd) : MAX_GUEST_USAGE;
  const currentUsedCount = weeklyFreeReviewUsed;
  const remainingLimit = Math.max(0, currentMaxLimit - currentUsedCount);

  const handleEditorChange = useCallback((value: string | undefined) => {
    setCode(value || '');
  }, []);

  const handleModelToggle = useCallback((model: string) => {
    if (model === 'openai' || model === 'claude') {
      alert(`${model === 'openai' ? 'OpenAI' : 'Claude'}는 추후 연동 예정입니다. 현재는 Gemini 리뷰만 가능합니다.`);
      return;
    }
    setSelectedModels(prev => 
      prev.includes(model) 
        ? (prev.length > 1 ? prev.filter(m => m !== model) : prev) 
        : [...prev, model]
    );
  }, []);

  const handleRequestReview = useCallback(async () => {
    setResults({});
    
    if (!code.trim()) {
      alert('리뷰할 코드를 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/reviews/ai', {
        code,
        language,
        models: selectedModels
      });
      
      setResults(response.data);
      
      if (!isLoggedIn || role === 'GUEST') {
        const usageRes = await api.get('/reviews/ai/guest-usage');
        setGuestUsage(usageRes.data);
      } else {
        try {
          const balanceRes = await api.get('/credits/balance');
          const { credits, totalSpentCredits, weeklyFreeReviewUsed, maxWeeklyFreeLimit } = balanceRes.data;
          updateCredits(credits, totalSpentCredits, weeklyFreeReviewUsed, maxWeeklyFreeLimit);
        } catch (e) {
          console.error('Failed to sync credit balance:', e);
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && (error.response?.status === 503 || error.response?.status === 429)) {
        alert('현재 AI 서비스 요청이 많습니다. 잠시 후(약 1분 뒤) 다시 시도해 주세요.');
      } else {
        const message = axios.isAxiosError(error) 
          ? (error.response?.data?.error?.message || 'AI 리뷰 요청 중 오류가 발생했습니다.') 
          : '알 수 없는 오류가 발생했습니다.';
        alert(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [code, language, selectedModels, isLoggedIn, role, updateCredits, setGuestUsage]);

  const lineCount = useMemo(() => code.split('\n').length, [code]);
  
  return (
    <div className="max-w-5xl mx-auto py-8 animate-in fade-in duration-500">
      <header className="mb-10 text-center">
        <h2 className="text-4xl font-black mb-4 text-slate-900 tracking-tight">AI 코드 리뷰 센터</h2>
        <p className="text-slate-600 text-lg font-medium italic opacity-80">"현업 시니어 개발자의 시선으로 당신의 코드를 분석합니다."</p>
      </header>

      <div className="mb-8 flex justify-center gap-4">
        {['openai', 'claude', 'gemini'].map(model => (
          <button
            key={model}
            onClick={() => handleModelToggle(model)}
            className={`px-6 py-3 rounded-2xl text-sm font-black transition-all border-2 ${
              selectedModels.includes(model)
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                : 'bg-white border-slate-200 text-slate-400 hover:border-blue-600 hover:text-blue-600'
            }`}
          >
            {model.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 mb-16 ring-1 ring-white/5">
        <div className="px-8 py-5 bg-slate-950 flex justify-between items-center border-b border-slate-800/50">
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 mr-4">
              <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] shadow-sm shadow-red-900/20"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] shadow-sm shadow-yellow-900/20"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] shadow-sm shadow-green-900/20"></div>
            </div>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-800 text-slate-300 border-none rounded-xl px-4 py-2 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
            >
              <option value="auto">언어 자동 감지</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
          </div>
          <div className={`text-xs font-black px-4 py-1.5 rounded-full border shadow-inner ${
            remainingLimit <= 0 ? 'text-red-400 border-red-900/30 bg-red-950/20' : 'text-blue-400 border-blue-900/30 bg-blue-950/20'
          }`}>
            {isLoggedIn && role !== 'GUEST' ? '주간 무료 한도' : '비회원 무료 체험'}: {remainingLimit} / {currentMaxLimit}
          </div>
        </div>
        
        <div className="h-[500px] w-full border-b border-slate-800/50">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              fontSize: 15,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 24, bottom: 24 },
            }}
          />
        </div>
        
        <div className="px-8 py-6 bg-slate-950 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-mono font-black flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
            {lineCount} 라인
          </span>
          <div className="flex flex-col items-end gap-1">
            {isLoggedIn && role !== 'GUEST' && (
              <span className="text-[10px] text-slate-400 font-black">
                예상 소모: {Math.max(0, selectedModels.length * 10 - Math.max(0, remainingLimit * 10))} C
              </span>
            )}
            <button 
              onClick={handleRequestReview}
              disabled={(remainingLimit <= 0 && credits < (selectedModels.length * 10)) || isLoading}
              className={`px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 ${
                (remainingLimit <= 0 && credits < (selectedModels.length * 10))
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none grayscale' 
                  : isLoading
                    ? 'bg-blue-800 text-white cursor-wait animate-pulse'
                    : 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700 hover:-translate-y-1 shadow-blue-900/20'
              }`}
            >
              {isLoading ? '분석 중...' : (remainingLimit <= 0) ? '크레딧으로 리뷰 시작' : 'AI 코드 리뷰 시작'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <h3 className="text-3xl font-black mb-8 flex items-center gap-4 text-slate-900">
          <span className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-100">📋</span> 
          AI 코드 리뷰 결과
        </h3>
        
        {Object.keys(results).length > 0 ? (
          Object.entries(results).map(([name, data]) => (
            <ReviewResultCard 
              key={name}
              displayName={MODEL_NAME_MAPPING[name] || name}
              data={data}
            />
          ))
        ) : (
          <div className="py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-10 shadow-sm">
            <div className="text-7xl mb-8 animate-bounce duration-1000">🎯</div>
            <h4 className="text-2xl font-black text-slate-900 mb-3">결과를 기다리고 있습니다</h4>
            <p className="text-slate-500 font-bold max-w-sm leading-relaxed">
              코드를 입력하고 분석 버튼을 눌러보세요. <br />
              AI Agent의 심도 있는 피드백이 제공됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiReviewPage;