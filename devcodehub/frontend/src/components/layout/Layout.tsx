import Header from './Header';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import { checkIsAppPage } from '../../utils/routeUtils';
import { Toast } from '../common/Toast';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import api from '../../services/api';
import { stompClient } from '../../services/stompClient';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const role = useAuthStore((state) => state.role);
  const loginId = useAuthStore((state) => state.loginId);

  /**
   * [Why] 로그인할 때 서버에 저장된 최근 알림을 한 번 가져오고, 이후에는 STOMP 구독으로 실시간 반영한다.
   * (예전처럼 페이지를 옮길 때마다 목록을 다시 불러오지 않는다.)
   */
  useEffect(() => {
    if (!isLoggedIn || role === 'GUEST') return;

    api
      .get('/notifications')
      .then((res) => {
        const latest = res.data
          .map((n: { id: number; content: string; createdAt: string }) => ({
            id: n.id,
            text: n.content,
            time: new Date(n.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          }))
          .slice(0, 5);
        useNotificationStore.getState().setNotifications(latest);
      })
      .catch((err) => console.error('알림 동기화 실패:', err));
  }, [isLoggedIn, role]);

  // 실시간 알림 구독: 개인 채널 + 역할 공용 채널(senior/admin)
  useEffect(() => {
    if (!isLoggedIn || role === 'GUEST' || !loginId) return;

    const handler = (message: Record<string, unknown> | string) => {
      if (typeof message === 'string') return;
      const store = useNotificationStore.getState();
      if (message.type === 'DELETE' && typeof message.keyword === 'string') {
        store.deleteNotificationsByKeyword(message.keyword);
      } else if (typeof message.text === 'string') {
        store.addNotification(message.text);
      }
    };

    const channels = [`/sub/notifications/${loginId}`];
    if (role === 'SENIOR' || role === 'ADMIN') channels.push('/sub/notifications/senior');
    if (role === 'ADMIN') channels.push('/sub/notifications/admin');

    channels.forEach((c) => stompClient.subscribe(c, handler));
    return () => channels.forEach((c) => stompClient.unsubscribe(c));
  }, [isLoggedIn, role, loginId]);

  const isAppPage = checkIsAppPage(location.pathname);

  // 1. [App 모드] (대시보드 등) - 사이드바 + 우측 메인 구조. 좁은 화면(lg 미만)에서는 사이드바가 햄버거로 여는 서랍이 된다.
  if (isAppPage) {
    return (
      <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden">
        <Toast />
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex flex-1 overflow-hidden relative">
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 lg:p-10 bg-slate-50 break-words">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // 2. [Landing 모드] (메인, 로그인, 가입) - 몰입형 배경과 고도화된 글래스모피즘
  return (
    <div className="w-full h-screen bg-mesh flex justify-center overflow-hidden relative">
      {/* 배경 장식 요소 (유동적 구체) */}
      <div className="blob animate-blob -top-20 -left-20 bg-blue-400/20"></div>
      <div className="blob animate-blob bottom-[-100px] right-[-100px] bg-indigo-400/20 [animation-delay:2s]"></div>
      <div className="blob animate-blob top-1/2 -left-40 bg-purple-400/10 [animation-delay:5s]"></div>
      
      {/* 배경 그리드 오버레이 */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
      
      <div className="relative w-full max-w-5xl glass-card glass-glow h-full flex flex-col shadow-2xl z-10">
        <Toast />
        <Header />
        <main className="flex-1 px-4 sm:px-12 py-8 sm:py-12 overflow-y-auto overflow-x-hidden text-gray-700 break-words">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
