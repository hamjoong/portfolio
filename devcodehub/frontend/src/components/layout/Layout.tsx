import Header from './Header';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import { checkIsAppPage } from '../../utils/routeUtils';
import { Toast } from '../common/Toast';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import api from '../../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, role } = useAuthStore();

  /**
   * [Why] 실시간 소켓 연결의 불안정성(유저별 구독 누락, 동기화 오류)을 해결하기 위해
   * 페이지 이동(location.pathname 변경) 시마다 서버의 최신 알림 목록을 API로 가져와 동기화함.
   * 실시간성이 완벽하지 않아도 시나리오별 알림의 정확성을 보장함.
   */
  useEffect(() => {
    const syncNotifications = async () => {
      if (!isLoggedIn || role === 'GUEST') return;

      try {
        const res = await api.get('/notifications');
        const latestNotifications = res.data.map((n: { id: number, content: string, createdAt: string }) => {
          // [Why] 백엔드 날짜 문자열에 타임존 정보가 없을 경우 브라우저의 현지 시간으로 변환
          const date = new Date(n.createdAt);
          return {
            id: n.id,
            text: n.content,
            time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
          };
        }).slice(0, 5);
        useNotificationStore.getState().setNotifications(latestNotifications);
      } catch (err) {
        console.error("알림 동기화 실패:", err);
      }
    };

    syncNotifications();
  }, [location.pathname, isLoggedIn, role]);

  const isAppPage = checkIsAppPage(location.pathname);

  // 1. [App 모드] (대시보드 등) - 사이드바 + 우측 메인 구조
  if (isAppPage) {
    return (
      <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden">
        <Toast />
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-10 bg-slate-50">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // 2. [Landing 모드] (메인, 로그인, 가입) - 몰입형 배경과 고도화된 글래스모피즘
  return (
    <div className="w-screen h-screen bg-mesh flex justify-center overflow-hidden relative">
      {/* 배경 장식 요소 (유동적 구체) */}
      <div className="blob animate-blob -top-20 -left-20 bg-blue-400/20"></div>
      <div className="blob animate-blob bottom-[-100px] right-[-100px] bg-indigo-400/20 [animation-delay:2s]"></div>
      <div className="blob animate-blob top-1/2 -left-40 bg-purple-400/10 [animation-delay:5s]"></div>
      
      {/* 배경 그리드 오버레이 */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
      
      <div className="relative w-full max-w-5xl glass-card glass-glow h-full flex flex-col shadow-2xl z-10">
        <Toast />
        <Header />
        <main className="flex-1 px-12 py-12 overflow-y-auto text-gray-700">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
