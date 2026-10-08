import { isAdminRequest } from "../_shared/adminAuthorization.mjs";
import { bearerToken, getDatabaseClient, jsonResponse, preflight } from "../_shared/http.ts";

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return preflight(request);
  if (request.method !== "POST") return jsonResponse(request, null, 405, "지원하지 않는 HTTP 메서드입니다.");

  const token = bearerToken(request);
  if (!token) return jsonResponse(request, null, 401, "로그인 세션을 확인할 수 없습니다.");

  try {
    const supabase = getDatabaseClient();
    const { data, error: authError } = await supabase.auth.getUser(token);
    if (authError || !data.user?.id) {
      return jsonResponse(request, null, 401, "인증된 사용자를 확인할 수 없습니다.");
    }

    // 관리자 계정은 탈퇴로 지워지면 관리 권한이 사라지므로 화면에서 직접 탈퇴하지 못하게 한다.
    if (await isAdminRequest(supabase, request.headers.get("authorization"))) {
      return jsonResponse(request, null, 403, "관리자 계정은 탈퇴할 수 없습니다.");
    }

    // 결제 완료·배송 중 주문이 있으면 RPC가 P0001로 거절한다. 익명화는 반복 호출해도 안전하다.
    const { error: anonymizeError } = await supabase.rpc("anonymize_customer_account", {
      p_auth_user_id: data.user.id,
    });
    if (anonymizeError?.code === "P0001") {
      return jsonResponse(request, null, 409, "결제 완료·배송 중인 주문이 있어 탈퇴할 수 없습니다. 주문 처리 후 다시 시도해 주세요.");
    }
    if (anonymizeError) throw anonymizeError;

    const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user.id);
    if (deleteError) {
      console.error("[account-withdrawal] Auth user deletion failed after anonymization", deleteError.message);
      return jsonResponse(
        request,
        null,
        502,
        "주문 정보 익명화는 완료했지만 계정 삭제는 완료되지 않았습니다. 잠시 후 다시 요청해 주세요.",
      );
    }

    return jsonResponse(request, null, 200, "계정이 삭제되고 주문의 개인정보가 익명화되었습니다.");
  } catch (error) {
    console.error("[account-withdrawal] request failed", error);
    return jsonResponse(request, null, 500, "계정 탈퇴 요청에 실패했습니다.");
  }
});
