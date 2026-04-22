import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useAuthGuard } from '../../hooks/useAuthGuard';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  updated_at: string;
}

const GithubPage: React.FC = () => {
  const { requireLogin } = useAuthGuard();
  const { loginId } = useAuthStore();
  
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requireLogin()) return;

    if (!loginId || !loginId.startsWith('github_')) {
      setError('GitHub 계정으로 로그인하거나 연동이 필요합니다.');
      setLoading(false);
      return;
    }

    const fetchRepos = async () => {
      try {
        setLoading(true);
        const response = await api.get('/github/repos');
        setRepos(response.data);
      } catch (err) {
        setError('레포지토리 목록을 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [requireLogin, loginId]);

  const handleSync = (repoName: string) => {
    alert(`[${repoName}] 레포지토리의 자동 분석(Webhook) 연동이 설정되었습니다.`);
  };

  if (loading) return <div className="text-center py-20">GitHub 데이터를 불러오는 중...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-2">GitHub 연동 및 자동 분석</h1>
        <p className="text-slate-500 font-medium text-lg">레포지토리를 연결하여 푸시할 때마다 AI 리뷰를 자동으로 받아보세요.</p>
      </header>

      {error ? (
        <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 text-center">
          <p className="text-red-600 font-black text-lg mb-6">{error}</p>
          <button className="px-8 py-3 bg-slate-900 text-white border-none rounded-2xl font-black cursor-pointer">GitHub 계정 연결하기</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {repos.map(repo => (
            <div key={repo.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-black text-slate-900 truncate pr-4">{repo.name}</h3>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase">{repo.language || 'Plain'}</span>
                </div>
                <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 h-10">{repo.description || '설명이 없습니다.'}</p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <span className="text-[10px] text-slate-400 font-bold tracking-tight">최근 업데이트: {new Date(repo.updated_at).toLocaleDateString()}</span>
                <button 
                  onClick={() => handleSync(repo.name)}
                  className="px-5 py-2 bg-blue-600 text-white border-none rounded-xl text-xs font-black cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  자동 분석 활성화
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GithubPage;
