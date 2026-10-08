import { resolveUserIdentity } from "../_shared/userIdentity.mjs";
import { isAdminRequest } from "../_shared/adminAuthorization.mjs";
import {
  bearerToken,
  getDatabaseClient,
  jsonResponse,
  pageResult,
  parsePage,
  preflight,
  serverError,
} from "../_shared/http.ts";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// 작성자 ID(user_id)는 공개 목록에 내보내지 않는다.
const QNA_COLUMNS =
  "id, product_id, title, content, answer, is_answered, created_at, product:products(name, main_image_url)";

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return preflight(request);

  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);
    // /qna/product/:productId, /qna/me, /qna/:qnaId/answer
    const last = segments[segments.length - 1];
    const secondLast = segments[segments.length - 2];

    const supabase = getDatabaseClient();
    const token = bearerToken(request);

    let userId: string | null = null;
    if (token) {
      try {
        userId = await resolveUserIdentity(supabase, token);
      } catch {
        // 인증 실패는 비로그인과 같게 취급한다.
      }
    }

    if (request.method === "GET") {
      const { page, size, from, to } = parsePage(url);

      if (secondLast === "product") {
        if (!UUID_PATTERN.test(last)) return jsonResponse(request, null, 400, "상품 ID가 올바르지 않습니다.");
        const { data, count, error } = await supabase
          .from("product_qnas")
          .select(QNA_COLUMNS, { count: "exact" })
          .eq("product_id", last)
          .order("created_at", { ascending: false })
          .range(from, to);
        if (error) return serverError(request, error);
        return jsonResponse(request, pageResult(data, count, page, size), 200, "상품 Q&A 조회 성공");
      }

      if (last === "me") {
        if (!userId) return jsonResponse(request, null, 401, "로그인이 필요합니다.");
        const { data, count, error } = await supabase
          .from("product_qnas")
          .select(QNA_COLUMNS, { count: "exact" })
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .range(from, to);
        if (error) return serverError(request, error);
        return jsonResponse(request, pageResult(data, count, page, size), 200, "내 Q&A 조회 성공");
      }
    }

    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));

      if (last === "answer") {
        if (!await isAdminRequest(supabase, request.headers.get("authorization"))) {
          return jsonResponse(request, null, 403, "관리자 권한이 필요합니다.");
        }
        const content = typeof body.content === "string" ? body.content.trim() : "";
        if (!UUID_PATTERN.test(secondLast) || !content || content.length > 2000) {
          return jsonResponse(request, null, 400, "답변 내용을 입력해 주세요.");
        }

        const { data, error } = await supabase
          .from("product_qnas")
          .update({ answer: content, is_answered: true, updated_at: new Date().toISOString() })
          .eq("id", secondLast)
          .select("id")
          .maybeSingle();
        if (error) return serverError(request, error);
        if (!data) return jsonResponse(request, null, 404, "문의를 찾을 수 없습니다.");
        return jsonResponse(request, null, 200, "Q&A 답변이 등록되었습니다.");
      }

      if (!userId) return jsonResponse(request, null, 401, "로그인이 필요합니다.");

      const { productId, title, content } = body;
      if (
        typeof productId !== "string" || !UUID_PATTERN.test(productId) ||
        typeof title !== "string" || !title.trim() || title.length > 200 ||
        typeof content !== "string" || !content.trim() || content.length > 2000
      ) {
        return jsonResponse(request, null, 400, "상품, 제목(200자 이내), 내용(2000자 이내)을 확인해 주세요.");
      }

      const { data, error } = await supabase
        .from("product_qnas")
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          product_id: productId,
          title: title.trim(),
          content: content.trim(),
          is_answered: false,
        })
        .select("id")
        .single();
      if (error) return serverError(request, error);
      return jsonResponse(request, data.id, 201, "문의가 등록되었습니다.");
    }

    return jsonResponse(request, null, 404, "지원하지 않는 경로입니다.");
  } catch (error) {
    return serverError(request, error);
  }
});
