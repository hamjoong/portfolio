import { resolveUserIdentity } from "../_shared/userIdentity.mjs";
import { bearerToken, getDatabaseClient, jsonResponse, preflight, serverError } from "../_shared/http.ts";

const GUEST_ID_PATTERN = /^guest-[a-zA-Z0-9-]{1,120}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 옵션 ID는 UUID 하나이거나 쉼표로 이은 UUID 목록이다. */
function isValidOptionId(value: string): boolean {
  return value.split(",").every((id) => UUID_PATTERN.test(id));
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return preflight(request);

  try {
    const guestHeader = request.headers.get("x-guest-id");
    const supabase = getDatabaseClient();
    const token = bearerToken(request);
    let ownerId: string;

    if (token) {
      try {
        ownerId = await resolveUserIdentity(supabase, token);
      } catch {
        return jsonResponse(request, null, 401, "인증된 사용자 정보를 확인할 수 없습니다.");
      }
    } else if (request.headers.get("authorization")) {
      return jsonResponse(request, null, 401, "로그인이 필요합니다.");
    } else if (guestHeader && GUEST_ID_PATTERN.test(guestHeader)) {
      ownerId = guestHeader;
    } else {
      return jsonResponse(request, null, 401, "비회원 장바구니 식별 정보가 필요합니다.");
    }

    const url = new URL(request.url);
    const last = url.pathname.split("/").filter(Boolean).pop() ?? "";

    if (request.method === "GET") {
      // { "productId" | "productId:optionId": quantity } 형태로 돌려준다.
      const { data, error } = await supabase
        .from("cart_items")
        .select("product_id, option_id, quantity")
        .eq("user_id", ownerId);
      if (error) return serverError(request, error);

      const cartMap: Record<string, number> = {};
      for (const item of data ?? []) {
        const key = item.option_id ? `${item.product_id}:${item.option_id}` : item.product_id;
        cartMap[key] = (cartMap[key] ?? 0) + item.quantity;
      }
      return jsonResponse(request, cartMap, 200, "장바구니 조회 성공");
    }

    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));

      if (last === "merge") {
        if (!token) return jsonResponse(request, null, 401, "비회원 장바구니 통합에는 회원 로그인이 필요합니다.");

        // 현재 요청이 가진 비회원 장바구니만 합칠 수 있다.
        const guestId = body.guestId;
        if (typeof guestId !== "string" || !GUEST_ID_PATTERN.test(guestId) || guestId !== guestHeader) {
          return jsonResponse(request, null, 400, "현재 요청의 비회원 장바구니만 통합할 수 있습니다.");
        }

        const { data: guestItems, error: guestError } = await supabase
          .from("cart_items")
          .select("product_id, option_id, quantity")
          .eq("user_id", guestId);
        if (guestError) return serverError(request, guestError);

        if (guestItems?.length) {
          const { error: upsertError } = await supabase.from("cart_items").upsert(
            guestItems.map((item) => ({
              user_id: ownerId,
              product_id: item.product_id,
              option_id: item.option_id,
              quantity: item.quantity,
              updated_at: new Date().toISOString(),
            })),
            { onConflict: "user_id,product_id,option_id" },
          );
          if (upsertError) return serverError(request, upsertError);
        }

        const { error: deleteError } = await supabase.from("cart_items").delete().eq("user_id", guestId);
        if (deleteError) return serverError(request, deleteError);
        return jsonResponse(request, null, 200, "장바구니 통합 완료");
      }

      const { productId, optionId = null } = body;
      const quantity = body.quantity ?? 1;
      if (typeof productId !== "string" || !UUID_PATTERN.test(productId)) {
        return jsonResponse(request, null, 400, "상품 ID가 올바르지 않습니다.");
      }
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return jsonResponse(request, null, 400, "수량은 1~99 사이의 정수여야 합니다.");
      }
      if (optionId !== null && (typeof optionId !== "string" || !isValidOptionId(optionId))) {
        return jsonResponse(request, null, 400, "옵션 ID가 올바르지 않습니다.");
      }

      const { error } = await supabase.from("cart_items").upsert({
        user_id: ownerId,
        product_id: productId,
        option_id: optionId || null,
        quantity,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,product_id,option_id" });
      if (error) return serverError(request, error);

      return jsonResponse(request, null, 200, "장바구니 상품 추가 성공");
    }

    if (request.method === "DELETE") {
      // /cart/:cartItemId — "productId" 또는 "productId:optionId"
      const [productId, optionId] = decodeURIComponent(last).split(":");
      if (!UUID_PATTERN.test(productId ?? "") || (optionId && !isValidOptionId(optionId))) {
        return jsonResponse(request, null, 400, "삭제할 장바구니 아이템 식별자가 올바르지 않습니다.");
      }

      let query = supabase.from("cart_items").delete().eq("user_id", ownerId).eq("product_id", productId);
      query = optionId ? query.eq("option_id", optionId) : query.is("option_id", null);
      const { error } = await query;
      if (error) return serverError(request, error);

      return jsonResponse(request, null, 200, "장바구니 상품 삭제 성공");
    }

    return jsonResponse(request, null, 405, "지원하지 않는 메서드입니다.");
  } catch (error) {
    return serverError(request, error);
  }
});
