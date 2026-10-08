import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const LoginCallback: React.FC = () => {
  const navigate = useNavigate();
  const loginToStore = useAuthStore((state) => state.login);
  // [Why] StrictMode에서 effect가 두 번 실행돼도 fragment 토큰을 한 번만 처리한다.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    // [Why] 토큰은 서버 로그·Referer에 남지 않도록 쿼리가 아닌 URL fragment(#token=...)로 전달받는다.
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    window.history.replaceState(null, '', window.location.pathname);
    if (token) {
      const fetchMyInfo = async () => {
        try {
          // api 인스턴스는 기본적으로 store의 토큰을 사용하지만, 
          // 여기서는 방금 받은 토큰을 직접 설정해줘야 할 수도 있습니다.
          // 하지만 api.ts의 interceptor가 store를 보므로, store에 먼저 저장하거나 header를 직접 줍니다.
          const response = await api.get('/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const { id, loginId, nickname, role, credits, totalSpentCredits, weeklyFreeReviewUsed, maxWeeklyFreeLimit, profileImageUrl, avatarUrl } = response.data;
          loginToStore(token, id, loginId, nickname, role, credits, totalSpentCredits, weeklyFreeReviewUsed, maxWeeklyFreeLimit, profileImageUrl ?? null, avatarUrl ?? null);
          navigate('/dashboard');
        } catch (error) {
          console.error('Fetch My Info Error:', error);
          alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
          navigate('/login');
        }
      };
      fetchMyInfo();
    } else {
      alert('로그인에 실패했습니다.');
      navigate('/login');
    }
  }, [navigate, loginToStore]);

  return (
    <div className="text-center mt-40">
      <h2>소셜 로그인 처리 중...</h2>
      <p>잠시만 기다려 주세요.</p>
    </div>
  );
};

export default LoginCallback;
