/** Authorization 헤더의 사용자가 `admin_users`에 등록된 관리자인지 확인합니다. */
export async function isAdminRequest(supabase, authorization) {
  if (!authorization?.startsWith("Bearer ")) return false;
  const accessToken = authorization.slice(7).trim();
  if (!accessToken) return false;

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user?.id) return false;

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("auth_user_id")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (adminError) throw new Error("관리자 권한을 확인하지 못했습니다.");
  return Boolean(admin);
}
