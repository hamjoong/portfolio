import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * 사이드바 컴포넌트 - React.memo 적용으로 불필요한 리렌더링 방지
 * GEMINI.md 규칙: 성능 최적화
 */
const Sidebar: React.FC = memo(() => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { nickname, role, profileImageUrl, avatarUrl } = useAuthStore();

  const handleProfileClick = () => {
    if (role === 'GUEST') {
      alert('비회원은 프로필을 수정할 수 없습니다.');
      return;
    }
    navigate('/dashboard?edit=true');
  };

  /** 사이드바 네비게이션 메뉴 정의 */
  const navigationItems = [
    { label: '🏠 대시보드 홈', path: '/dashboard' },
    { label: '💳 내 크레딧', path: '/credits' },
    { label: '📊 IT 스킬 게시판', path: '/boards/skill' },
    { label: '🤖 AI 정보 게시판', path: '/boards/ai' },
    { label: '🔖 북마크한 글', path: '/boards/me/bookmarks' },
    { label: '🔍 AI 코드 리뷰', path: '/ai-review' },
    { label: '👨‍🏫 시니어 리뷰', path: '/senior-review' },
    { label: '💬 실시간 채팅', path: '/chat' },
  ];

  const navigationButtonClasses = "px-4 py-3.5 text-left bg-transparent border-none rounded-2xl text-sm font-bold text-slate-600 cursor-pointer transition-all duration-200 hover:bg-slate-50";

  const profileImageSource = profileImageUrl
    || avatarUrl
    || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname || 'Guest'}`;

  return (
    <aside className="w-[280px] h-full bg-white border-r border-slate-200 p-5 flex flex-col">
      <div className="text-center mb-5 flex-shrink-0">
        <div
          onClick={() => navigate('/dashboard')}
          className="w-24 h-24 rounded-[1.75rem] bg-slate-50 mx-auto mb-4 overflow-hidden border-4 border-white shadow-md cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
        >
          <img
            src={profileImageSource}
            alt="avatar"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <h2
          onClick={() => navigate('/dashboard')}
          className="text-lg font-black m-0 mb-4 text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
        >
          {nickname || '방문자'}
        </h2>
        <button
          onClick={handleProfileClick}
          className="px-3 py-3 text-xs font-black text-blue-600 bg-blue-50 border-none rounded-lg cursor-pointer"
        >
          프로필 설정
        </button>
      </div>

      <nav className="flex flex-col flex-grow overflow-y-auto gap-1 min-h-0">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 pl-4">주요 서비스</p>
        {navigationItems.map(menuItem => (
          <button
            key={menuItem.path}
            onClick={() => navigate(menuItem.path)}
            className={navigationButtonClasses}
          >
            {menuItem.label}
          </button>
        ))}

        {role === 'ADMIN' && (
          <div className="mt-6">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3.5 pl-4">시스템 관리</p>
            <button
              onClick={() => navigate('/admin')}
              className={`${navigationButtonClasses} text-blue-600 bg-blue-50 hover:bg-blue-100 w-full`}
            >
              ⚙️ 관리자 센터
            </button>
          </div>
        )}
      </nav>

      <div className="pt-1 flex-shrink-0 border-t border-slate-100 mt-1">
        <button
          onClick={() => {
            if (window.confirm('로그아웃 하시겠습니까?')) {
              logout();
              navigate('/');
            }
          }}
          className="px-3 py-1 w-full text-left bg-transparent border-none rounded-2xl text-sm font-bold text-red-600 cursor-pointer transition-all duration-200 hover:bg-red-50"
        >
          🚪 로그아웃
        </button>
      </div>
    </aside>
  );
});

export default Sidebar;
