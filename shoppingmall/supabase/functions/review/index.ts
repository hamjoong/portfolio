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
const REVIEW_COLUMNS = "id, product_id, order_id, rating, content, image_url, admin_reply, replied_at, created_at";
const REVIEWABLE_STATUSES = ["PAID", "SHIPPED", "COMPLETED"];

function validRating(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 5;
}

function validContent(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 2000;
}

function imageUrlOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 && value.length <= 1000 ? value : null;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return preflight(request);

  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);
    // /review/product/:productId, /review/me, /review/:reviewId, /review/:reviewId/reply
    const last = segments[segments.length - 1];
    const secondLast = segments[segments.length - 2];

    const supabase = getDatabaseClient();
    const token = bearerToken(request);

    let userId: string | null = null;
    if (token) {
      try {
        userId = await resolveUserIdentity(supabase, token);
      } catch {
        // 인증 실패는 비로그인과 같게 취급한다. 로그인이 필요한 경로에서 401을 돌려준다.
      }
    }

    if (request.method === "GET") {
      const { page, size, from, to } = parsePage(url);

      if (secondLast === "product") {
        if (!UUID_PATTERN.test(last)) return jsonResponse(request, null, 400, "상품 ID가 올바르지 않습니다.");
        const { data, count, error } = await supabase
          .from("reviews")
          .select(REVIEW_COLUMNS, { count: "exact" })
          .eq("product_id", last)
          .order("created_at", { ascending: false })
          .range(from, to);
        if (error) return serverError(request, error);
        return jsonResponse(request, pageResult(data, count, page, size), 200, "상품 리뷰 조회 성공");
      }

      if (last === "me") {
        if (!userId) return jsonResponse(request, null, 401, "로그인이 필요합니다.");
        const { data, count, error } = await supabase
          .from("reviews")
          .select(REVIEW_COLUMNS, { count: "exact" })
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .range(from, to);
        if (error) return serverError(request, error);
        return jsonResponse(request, pageResult(data, count, page, size), 200, "내 리뷰 조회 성공");
      }
    }

    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));

      if (last === "reply") {
        if (!await isAdminRequest(supabase, request.headers.get("authorization"))) {
          return jsonResponse(request, null, 403, "관리자 권한이 필요합니다.");
        }
        const content = typeof body.content === "string" ? body.content.trim() : "";
        if (!UUID_PATTERN.test(secondLast) || !content || content.length > 2000) {
          return jsonResponse(request, null, 400, "답변 내용을 입력해 주세요.");
        }

        const { data, error } = await supabase
          .from("reviews")
          .update({ admin_reply: content, replied_at: new Date().toISOString() })
          .eq("id", secondLast)
          .select("id")
          .maybeSingle();
        if (error) return serverError(request, error);
        if (!data) return jsonResponse(request, null, 404, "리뷰를 찾을 수 없습니다.");
        return jsonResponse(request, null, 200, "리뷰 답변이 등록되었습니다.");
      }

      if (!userId) return jsonResponse(request, null, 401, "로그인이 필요합니다.");

      const { productId, orderId, rating, content, imageUrl } = body;
      if (
        typeof productId !== "string" || !UUID_PATTERN.test(productId) ||
        typeof orderId !== "string" || !UUID_PATTERN.test(orderId) ||
        !validRating(rating) || !validContent(content)
      ) {
        return jsonResponse(request, null, 400, "상품, 주문, 별점(1~5), 내용(2000자 이내)을 확인해 주세요.");
      }

      // 본인의 결제 완료 주문에 담긴 상품만 리뷰할 수 있다.
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id")
        .eq("id", orderId)
        .eq("user_id", userId)
        .in("status", REVIEWABLE_STATUSES)
        .maybeSingle();
      if (orderError) return serverError(request, orderError);

      const { data: line, error: lineError } = order
        ? await supabase.from("order_items").select("id").eq("order_id", orderId).eq("product_id", productId).limit(1).maybeSingle()
        : { data: null, error: null };
      if (lineError) return serverError(request, lineError);
      if (!order || !line) return jsonResponse(request, null, 403, "구매한 상품에만 리뷰를 작성할 수 있습니다.");

      const { data: existing, error: existingError } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", userId)
        .eq("order_id", orderId)
        .eq("product_id", productId)
        .limit(1)
        .maybeSingle();
      if (existingError) return serverError(request, existingError);
      if (existing) return jsonResponse(request, null, 409, "이미 이 주문 상품에 리뷰를 작성했습니다.");

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          product_id: productId,
          order_id: orderId,
          rating,
          content: content.trim(),
          image_url: imageUrlOrNull(imageUrl),
        })
        .select("id")
        .single();
      if (error) return serverError(request, error);
      return jsonResponse(request, data.id, 201, "리뷰가 등록되었습니다.");
    }

    if (request.method === "PUT") {
      if (!userId) return jsonResponse(request, null, 401, "로그인이 필요합니다.");
      if (!UUID_PATTERN.test(last)) return jsonResponse(request, null, 400, "리뷰 ID가 올바르지 않습니다.");

      const { rating, content, imageUrl } = await request.json().catch(() => ({}));
      if (!validRating(rating) || !validContent(content)) {
        return jsonResponse(request, null, 400, "별점(1~5)과 내용(2000자 이내)을 확인해 주세요.");
      }

      const { data, error } = await supabase
        .from("reviews")
        .update({
          rating,
          content: content.trim(),
          image_url: imageUrlOrNull(imageUrl),
          updated_at: new Date().toISOString(),
        })
        .eq("id", last)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();
      if (error) return serverError(request, error);
      if (!data) return jsonResponse(request, null, 404, "수정할 리뷰를 찾을 수 없습니다.");
      return jsonResponse(request, null, 200, "리뷰가 수정되었습니다.");
    }

    if (request.method === "DELETE") {
      if (!userId) return jsonResponse(request, null, 401, "로그인이 필요합니다.");
      if (!UUID_PATTERN.test(last)) return jsonResponse(request, null, 400, "리뷰 ID가 올바르지 않습니다.");

      const { data, error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", last)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();
      if (error) return serverError(request, error);
      if (!data) return jsonResponse(request, null, 404, "삭제할 리뷰를 찾을 수 없습니다.");
      return jsonResponse(request, null, 200, "리뷰가 삭제되었습니다.");
    }

    return jsonResponse(request, null, 404, "지원하지 않는 경로입니다.");
  } catch (error) {
    return serverError(request, error);
  }
});
