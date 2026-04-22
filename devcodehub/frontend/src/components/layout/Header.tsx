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

const Header: React.FC = memo(() => {
  const navigate = useNavigate();
  const { isLoggedIn, nickname, logout } = useAuthStore();

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
    <header className="w-full h-[70px] bg-white border-b border-slate-100 flex items-center px-8 justify-between flex-shrink-0">
      <div
        onClick={() => navigate('/')}
        className="text-2xl font-black text-blue-600 cursor-pointer -tracking-tight"
      >
        DevCodeHub
      </div>

      <nav className="flex gap-6 items-center">
        {isLoggedIn ? (
          <>
            <div
              onClick={() => navigate('/dashboard')}
              className="text-sm font-bold text-gray-600 cursor-pointer"
            >
              <span className="text-blue-600">{nickname}</span>님 환영합니다!
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
            <div className="flex gap-2.5">
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
            <div className="h-5 w-px bg-slate-200"></div>
            <Link to="/login" className="no-underline text-gray-600 text-sm font-bold">로그인</Link>
            <button
              onClick={() => navigate('/signup')}
              className="px-4.5 py-2.5 bg-blue-600 text-white border-none rounded cursor-pointer text-sm font-semibold"
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
