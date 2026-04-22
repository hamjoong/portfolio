import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../../components/admin/AdminDashboard';
import UserManagement from '../../components/admin/UserManagement';
import ContentManagement from '../../components/admin/ContentManagement';
import AdminLogs from '../../components/admin/AdminLogs';

interface VerificationRequest {
  id: number;
  userLoginId: string;
  userNickname: string;
  githubUrl: string;
  linkedInUrl: string;
  blogUrl: string;
  careerSummary: string;
  status: string;
  createdAt: string;
}

const AdminPage: React.FC = () => {
  const { role } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content' | 'verifications' | 'logs'>('dashboard');
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loadingVeri, setLoadingVeri] = useState(false);

  const fetchVerifications = useCallback(async () => {
    setLoadingVeri(true);
    try {
      const res = await api.get('/admin/verifications');
      setVerifications(res.data);
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    } finally {
      setLoadingVeri(false);
    }
  }, []);

  useEffect(() => {
    if (role !== 'ADMIN') {
      alert('관리자만 접근 가능합니다.');
      navigate('/dashboard');
      return;
    }
    if (activeTab === 'verifications') {
      fetchVerifications();
    }
  }, [role, activeTab, fetchVerifications, navigate]);

  const handleApprove = async (id: number) => {
    if (!window.confirm('시니어 승인을 수락하시겠습니까?')) return;
    try {
      await api.patch(`/admin/verifications/${id}/approve`);
      alert('승인되었습니다.');
      fetchVerifications();
    } catch {
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt('반려 사유를 입력해 주세요.', '조건 미달');
    if (reason === null) return;
    
    try {
      await api.patch(`/admin/verifications/${id}/reject`, { reason });
      alert('반려되었습니다.');
      fetchVerifications();
    } catch {
      alert('처리 중 오류가 발생했습니다.');
    }
  };

  const tabItems: { id: 'dashboard' | 'users' | 'content' | 'verifications' | 'logs'; label: string; count?: number }[] = [
    { id: 'dashboard', label: '📊 통계 대시보드' },
    { id: 'users', label: '👥 사용자 관리' },
    { id: 'content', label: '📝 콘텐츠 관리' },
    { id: 'verifications', label: '🎓 시니어 인증', count: verifications.filter(v => v.status === 'PENDING').length },
    { id: 'logs', label: '📜 운영 로그' },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-2">관리자 센터</h1>
        <p className="text-slate-500 font-medium text-lg">시스템 전반의 지표 확인 및 통합 운영 관리를 수행합니다.</p>
      </header>

      <nav className="flex gap-2 mb-12 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm sticky top-0 z-20">
        {tabItems.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <main className="min-h-[600px]">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'content' && <ContentManagement />}
        {activeTab === 'logs' && <AdminLogs />}
        
        {activeTab === 'verifications' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 space-y-6">
            {loadingVeri ? (
              <div className="text-center py-20 text-slate-400 font-bold">로딩 중...</div>
            ) : verifications.length === 0 ? (
              <p className="text-center py-20 text-slate-400 font-bold">대기 중인 인증 요청이 없습니다.</p>
            ) : (
              verifications.map(v => (
                <div key={v.id} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 mb-1">{v.userNickname}님의 시니어 신청</h3>
                      <p className="text-sm text-slate-400 font-medium">신청일: {new Date(v.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleReject(v.id)} className="px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-black cursor-pointer hover:bg-slate-50">반려</button>
                      <button onClick={() => handleApprove(v.id)} className="px-6 py-2.5 bg-blue-600 text-white border-none rounded-xl text-sm font-black cursor-pointer hover:bg-blue-700 shadow-lg shadow-blue-100">최종 승인</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {v.githubUrl && <a href={v.githubUrl} target="_blank" rel="noreferrer" className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 truncate hover:text-blue-600 text-center">🔗 GitHub</a>}
                    {v.linkedInUrl && <a href={v.linkedInUrl} target="_blank" rel="noreferrer" className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 truncate hover:text-blue-600 text-center">🔗 LinkedIn</a>}
                    {v.blogUrl && <a href={v.blogUrl} target="_blank" rel="noreferrer" className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 truncate hover:text-blue-600 text-center">🔗 Blog</a>}
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">경력 및 프로젝트 요약</h4>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{v.careerSummary}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;

