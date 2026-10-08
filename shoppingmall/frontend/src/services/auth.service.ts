import { SignupRequest, LoginData } from '@/types/auth';
import { saveSupabaseCustomerProfile, signInSupabase, signUpSupabase } from '@/utils/supabaseAuth';

/**
 * 인증 관련 호출을 전담합니다. 인증은 Supabase Auth만 사용합니다.
 */
export const authService = {
  /**
   * 회원가입을 요청합니다. 가입 직후 세션을 받아 프로필까지 저장합니다.
   */
  async signup(data: SignupRequest): Promise<LoginData> {
    const email = data.email.trim().toLowerCase();
    const session = await signUpSupabase(email, data.password ?? '');
    if (!session.access_token || !session.user?.id) {
      throw new Error(
        '가입 세션을 받지 못했습니다. Supabase Auth에서 이메일 확인을 비활성화해야 즉시 로그인할 수 있습니다. 가입된 미확인 계정이 있으면 Dashboard에서 정리한 뒤 다시 시도하세요.',
      );
    }

    try {
      await saveSupabaseCustomerProfile(session.access_token, {
        authUserId: session.user.id,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        detailAddress: data.detailAddress,
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : '알 수 없는 오류';
      throw new Error(`계정은 생성됐지만 프로필 저장에 실패했습니다: ${detail}`);
    }

    return {
      userId: session.user.id,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      role: 'ROLE_USER',
    };
  },

  async login(data: Pick<SignupRequest, 'email' | 'password'>): Promise<LoginData> {
    const session = await signInSupabase(data.email.trim().toLowerCase(), data.password ?? '');
    if (!session.access_token || !session.user?.id) {
      throw new Error('Supabase 로그인 세션을 획득하지 못했습니다.');
    }

    return {
      userId: session.user.id,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      role: 'ROLE_USER',
    };
  },
};
