import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useToastStore } from '../../store/toastStore';
import ProfileEditModal from '../../components/dashboard/ProfileEditModal';
import { GrowthChart } from '../../components/dashboard/GrowthChart';
import { RankingBoard } from '../../components/dashboard/RankingBoard';

interface Badge {
  name: string;
  description: string;
}

interface UserInfo {
  id: number;
  loginId: string;
  nickname: string;
  email: string;
  contact: string;
  address: string;
  credits: number;
  totalSpentCredits: number;
  weeklyFreeReviewUsed: number;
  maxWeeklyFreeLimit: number;
  level: number;
  experience: number;
  ranking: number;
  profileImageUrl: string | null;
  avatarUrl: string | null;
  role: string;
  badges: Badge[];
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, role } = useAuthStore(useShallow((state) => ({
    accessToken: state.accessToken,
    role: state.role
  })));
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const previousBadgesRef = useRef<string[]>([]);

  // 1. 사용자 정보 페칭
  const { data: userInfo, refetch: refetchUser } = useQuery<UserInfo>({
    queryKey: ['user', accessToken],
    queryFn: async () => {
      if (!accessToken || role === 'GUEST') {
        const usageRes = await api.get('/reviews/ai/guest-usage');
        useAuthStore.getState().setGuestUsage(usageRes.data);
        return {
          id: 0, 
          loginId: 'guest', 
          nickname: '방문자', 
          email: 'guest@example.com', 
          contact: '',
          address: '',
          credits: 0,
          totalSpentCredits: 0,
          weeklyFreeReviewUsed: usageRes.data,
          maxWeeklyFreeLimit: 3, 
          level: 1, 
          experience: 0, 
          ranking: 0,
          profileImageUrl: null,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`,
          role: 'GUEST',
          badges: []
        };
      }
      const res = await api.get('/users/me');
      return res.data as UserInfo;
    },
    enabled: true
  });

  // 2. 대시보드 데이터 페칭
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard', accessToken],
    queryFn: async () => {
      if (!accessToken || role === 'GUEST') return null;
      const [graph, activity, rank, noti] = await Promise.all([
        api.get('/users/me/growth-graph'),
        api.get('/users/me/activity-logs'),
        api.get('/rankings'),
        api.get('/notifications')
      ]);
      
      const notiData = noti.data.map((n: { id: number; content: string | object; createdAt: string }) => ({
          id: n.id,
          text: typeof n.content === 'string' ? n.content : JSON.stringify(n.content),
          time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })).slice(0, 5);
      useNotificationStore.getState().setNotifications(notiData);

      return { growth: graph.data, activity: activity.data, rankings: rank.data };
    },
    enabled: !!accessToken && role !== 'GUEST'
  });

  useEffect(() => {
    if (userInfo?.badges) {
      const currentBadgeNames = userInfo.badges.map((b) => b.name);
      const newBadge = currentBadgeNames.find((name: string) => !previousBadgesRef.current.includes(name));
      if (newBadge && previousBadgesRef.current.length > 0) {
        useToastStore.getState().showToast(`축하합니다! '${newBadge}' 뱃지를 획득하셨습니다!`);
      }
      previousBadgesRef.current = currentBadgeNames;
    }
  }, [userInfo]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('edit') === 'true') {
      setIsEditModalOpen(true);
      navigate(window.location.pathname, { replace: true });
    }
  }, [location.search, navigate]);

  if (!userInfo) return <div className="text-center pt-40">로딩 중...</div>;

  return (
    <>
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900">대시보드</h1>
        <div className="flex items-center gap-6 mt-4">
          <p className="text-slate-600 text-lg">{userInfo.nickname}님의 성장 레포트입니다.</p>
          <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-black text-sm">LV. {dashboardData?.growth.level || 1}</div>
        </div>
      </header>

      <section className="grid grid-cols-4 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm col-span-2">
          <div className="flex justify-between items-center mb-3">
             <span className="text-sm font-bold text-slate-600">성장 경험치 ({dashboardData?.growth.currentExp || 0} / {dashboardData?.growth.nextLevelExp || 100} XP)</span>
             <span className="text-sm font-black text-blue-600">{Math.floor(dashboardData?.growth.progress || 0)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${dashboardData?.growth.progress || 0}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-sm font-bold text-slate-600 block mb-3">보유 크레딧</span>
          <div className="text-3xl font-black text-slate-900"><span className="text-blue-600">{(userInfo.credits || 0).toLocaleString()}</span> C</div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-sm font-bold text-slate-600 block mb-3">주간 AI 리뷰 한도</span>
          <div className="text-3xl font-black text-slate-900">
            <span className="text-green-600">{(userInfo.maxWeeklyFreeLimit || 0) - (userInfo.weeklyFreeReviewUsed || 0)}</span> / {userInfo.maxWeeklyFreeLimit || 0}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-[1fr_400px] gap-10 mt-10">
        <section className="bg-white p-10 rounded-3xl border border-slate-200">
          <h3 className="text-xl font-bold m-0 text-slate-900 mb-8">내 성장 그래프 (최근 7일)</h3>
          <GrowthChart data={dashboardData?.activity || []} />
        </section>

        <section className="flex flex-col gap-6">
          <RankingBoard users={dashboardData?.rankings || []} />
          <div className="bg-white p-10 rounded-3xl border border-slate-200 flex flex-col gap-6">
            <h3 className="text-xl font-bold m-0 text-slate-900">내 뱃지 ({userInfo.badges?.length || 0})</h3>
            <div className="flex flex-wrap gap-4">
               {userInfo.badges?.map((badge, i) => {
                  const emojiMap: Record<string, string> = { 'FIRST_POST': '🐣', 'MASTER_DEV': '🚀', 'REVIEW_MASTER': '🎓', 'COMMUNITY_KING': '👑' };
                  return (
                    <div key={i} title={badge.description} className="flex flex-col items-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:border-blue-200 transition-all">
                      <span className="text-4xl">{emojiMap[badge.name] || '🎖️'}</span>
                      <span className="text-xs font-black text-slate-800">{badge.name}</span>
                    </div>
                  );
               })}
            </div>
            
            <h3 className="text-xl font-bold m-0 text-slate-900 mt-4">알림 센터</h3>
            <div className="flex flex-col gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100 min-h-[150px]">
              {useNotificationStore.getState().notifications.map(n => (
                <div key={n.id} className="p-4 bg-white rounded-xl text-sm font-medium shadow-sm border border-slate-100">
                  <span className="text-[10px] text-slate-400 mr-2">{n.time}</span>
                  {n.text}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {isEditModalOpen && (
        <ProfileEditModal 
          userInfo={userInfo} 
          onClose={() => setIsEditModalOpen(false)} 
          onSaved={() => { setIsEditModalOpen(false); refetchUser(); }} 
        />
      )}
    </>
  );
};

export default DashboardPage;