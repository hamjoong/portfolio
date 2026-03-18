import api from '@/utils/api';
import { SignupRequest, ApiResponse, LoginData } from '@/types/auth';

/**
 * 인증 관련 API 호출을 전담하는 서비스입니다.
 */
export const authService = {
  /**
   * 회원가입을 요청합니다.
   */
  async signup(data: SignupRequest): Promise<string> {
    const response = await api.post<ApiResponse<string>>('/auth/signup', data);
    return response.data.data;
  },

  /**
   * 로그인을 요청합니다.
   */
  async login(data: Pick<SignupRequest, 'email' | 'password'>): Promise<LoginData> {
    const response = await api.post<ApiResponse<LoginData>>('/auth/login', data);
    return response.data.data;
  },

  /**
   * 비회원(Guest) 인증을 요청합니다.
   * [이유] 로그인이 필수는 아니지만 식별자가 필요한 주문/장바구니 기능을 위해 토큰을 발급받기 위함입니다.
   */
  async guestLogin(): Promise<{ accessToken: string }> {
    const response = await api.post<ApiResponse<{ accessToken: string }>>('/guest/auth');
    return response.data.data;
  },

  /**
   * 로그아웃 처리를 수행합니다.
   * [이유] 로컬에 저장된 인증 정보를 삭제하여 보안성을 확보하기 위함입니다.
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
  },
};
