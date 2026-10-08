/**
 * 요청의 Supabase 액세스 토큰에서 사용자 ID(Auth UID)를 확인합니다.
 * 검증 실패는 예외로 알립니다. 인증은 Supabase Auth만 사용합니다.
 */
export async function resolveUserIdentity(supabase, accessToken) {
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user?.id) {
    throw new Error("인증된 Supabase 사용자를 확인할 수 없습니다.");
  }
  return data.user.id;
}
