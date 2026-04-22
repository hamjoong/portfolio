import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { getSocialLoginUrl } from '../../services/constants';
import type { SocialProvider } from '../../services/constants';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginToStore = useAuthStore((state) => state.login);

  const [loginFormData, setLoginFormData] = useState({
    loginId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // 페이지 이동 시 데이터 초기화
  useEffect(() => {
    setLoginFormData({ loginId: '', password: '' });
  }, [location.key]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLoginFormData(previousData => ({ ...previousData, [name]: value }));
  };

  /**
   * [Why]
   * - 사용자 입력 데이터를 서버에 POST 요청하여 인증을 수행함.
   * - 성공 시 서버에서 발급한 JWT와 사용자 정보를 전역 스토어(authStore)에 저장하여 후속 요청에서 사용할 수 있도록 함.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!loginFormData.loginId.trim() || !loginFormData.password.trim()) return;

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', loginFormData);
      const { accessToken, id, loginId, nickname, role, credits, totalSpentCredits, weeklyFreeReviewUsed, maxWeeklyFreeLimit, profileImageUrl, avatarUrl } = response.data;
      loginToStore(accessToken, id, loginId, nickname, role, credits, totalSpentCredits, weeklyFreeReviewUsed, maxWeeklyFreeLimit, profileImageUrl, avatarUrl);
      navigate('/dashboard');
    } catch {
      alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  /** [Why] 환경 변수 기반으로 구성된 백엔드 소셜 로그인 엔드포인트로 리다이렉트하여 OAuth 2.0 흐름을 시작함. */
  const handleSocialLogin = (provider: SocialProvider) => {
    window.location.href = getSocialLoginUrl(provider);
  };

  const socialButtonBaseClasses = "py-3.5 rounded-2xl cursor-pointer text-sm font-black border-2 border-slate-200 hover:opacity-80 transition-opacity";

  return (
    <div key={location.key} className="max-w-lg mx-auto my-8 p-10 bg-white rounded-3xl shadow-md border border-slate-200">
      <h2 className="text-center mb-3.5 font-black text-slate-900 text-2xl">DevCodeHub 로그인</h2>
      <p className="text-center text-slate-600 mb-10 text-base font-medium">
        커뮤니티와 함께 성장을 시작하세요.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-bold text-slate-700">아이디</label>
          <input
            type="text"
            name="loginId"
            value={loginFormData.loginId}
            onChange={handleChange}
            required
            className="py-2.5 px-4.5 border-2 border-slate-200 rounded-2xl text-base outline-none bg-slate-50 text-black font-medium focus:border-blue-600"
            placeholder="아이디를 입력하세요"
            autoComplete="username"
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-bold text-slate-700">비밀번호</label>
          <input
            type="password"
            name="password"
            value={loginFormData.password}
            onChange={handleChange}
            required
            className="py-2.5 px-4.5 border-2 border-slate-200 rounded-2xl text-base outline-none bg-slate-50 text-black font-medium focus:border-blue-600"
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="py-4 bg-blue-600 text-white border-none rounded-2xl text-lg font-black cursor-pointer mt-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="mt-10">
        <div className="relative border-t border-slate-200 text-center mb-6">
          <span className="relative -top-3.5 bg-white px-4 text-sm text-slate-500 font-semibold">또는 소셜 로그인</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleSocialLogin('google')} className={`${socialButtonBaseClasses} bg-slate-400 text-gray-600`}>Google</button>
          <button onClick={() => handleSocialLogin('github')} className={`${socialButtonBaseClasses} bg-gray-900 text-white`}>GitHub</button>
          <button onClick={() => handleSocialLogin('kakao')} className={`${socialButtonBaseClasses} bg-yellow-400 text-gray-600`}>Kakao</button>
          <button onClick={() => handleSocialLogin('naver')} className={`${socialButtonBaseClasses} bg-green-600 text-white`}>Naver</button>
        </div>
      </div>

      <div className="mt-10 text-center text-sm">
        <Link to="/find-id" className="text-slate-600 no-underline font-semibold hover:text-slate-900">아이디 찾기</Link>
        <span className="text-slate-300 mx-4">|</span>
        <Link to="/find-pw" className="text-slate-600 no-underline font-semibold hover:text-slate-900">비밀번호 찾기</Link>
        <span className="text-slate-300 mx-4">|</span>
        <Link to="/signup" className="text-blue-600 no-underline font-black hover:text-blue-700">회원가입</Link>
      </div>
    </div>
  );
};

export default LoginPage;
