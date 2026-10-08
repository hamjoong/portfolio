import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getSocialLoginUrl } from '../../services/constants';
import type { SocialProvider } from '../../services/constants';

/**
 * 소셜 로그인 프로바이더별 스타일 매핑
 * GEMINI.md 규칙: 매직 넘버 금지, 가독성 우선
 */
const SOCIAL_BUTTON_STYLES: Record<string, string> = {
  google: 'bg-slate-400 text-gray-600',
  kakao: "bg-[#FEE500] text-slate-900 border-[#FEE500]",
  naver: "bg-[#03C75A] text-white border-[#03C75A]",
  github: "bg-[#181717] text-white border-[#181717]",
};

const SOCIAL_BUTTON_LABELS: Record<string, string> = {
  google: 'G',
  kakao: 'K',
  naver: 'N',
  github: 'GH',
};

interface HeaderProps {
  /** 앱 모드에서 좁은 화면일 때 사이드바를 여는 햄버거 버튼 핸들러 (없으면 버튼을 숨김) */
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = memo(({ onMenuClick }) => {
  const navigate = useNavigate();
  // [Why] 스토어 전체를 구독하면 크레딧 등 무관한 값이 바뀔 때마다 헤더가 다시 그려진다. 필요한 값만 구독한다.
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const nickname = useAuthStore((state) => state.nickname);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
      navigate('/');
    }
  };

  const handleSocialLogin = (provider: SocialProvider) => {
  // eslint-disable-next-line react-hooks/immutability
    window.location.href = getSocialLoginUrl(provider);
  };

  const socialButtonBaseClasses = "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors";

  return (
    <header className="w-full h-[70px] bg-white border-b border-slate-100 flex items-center px-4 sm:px-8 justify-between flex-shrink-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label="메뉴 열기"
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border-none text-xl cursor-pointer"
          >
            ☰
          </button>
        )}
        <div
          onClick={() => navigate('/')}
          className="text-xl sm:text-2xl font-black text-blue-600 cursor-pointer -tracking-tight"
        >
          DevCodeHub
        </div>
      </div>

      <nav className="flex gap-3 sm:gap-6 items-center min-w-0">
        {isLoggedIn ? (
          <>
            <div
              onClick={() => navigate('/dashboard')}
              className="text-sm font-bold text-gray-600 cursor-pointer truncate max-w-[30vw] sm:max-w-none"
            >
              <span className="text-blue-600">{nickname}</span><span className="hidden sm:inline">님 환영합니다!</span>
            </div>
            <div className="h-5 w-px bg-slate-200"></div>
            <button
              onClick={handleLogout}
              className="bg-none border-none text-slate-500 text-sm font-semibold cursor-pointer"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <div className="hidden sm:flex gap-2.5">
              {(['google', 'kakao', 'naver', 'github'] as const).map(provider => (
                <button
                  key={provider}
                  onClick={() => handleSocialLogin(provider)}
                  className={`${socialButtonBaseClasses} ${SOCIAL_BUTTON_STYLES[provider] || ''}`}
                >
                  {SOCIAL_BUTTON_LABELS[provider]}
                </button>
              ))}
            </div>
            <div className="hidden sm:block h-5 w-px bg-slate-200"></div>
            <Link to="/login" className="no-underline text-gray-600 text-sm font-bold">로그인</Link>
            <button
              onClick={() => navigate('/signup')}
              className="px-3 sm:px-4.5 py-2.5 bg-blue-600 text-white border-none rounded cursor-pointer text-sm font-semibold whitespace-nowrap"
            >
              시작하기
            </button>
          </>
        )}
      </nav>
    </header>
  );
});

export default Header;
