import { hashClientKey } from "../_shared/clientKey.mjs";
import { resolveUserIdentity } from "../_shared/userIdentity.mjs";
import {
  bearerToken,
  getDatabaseClient,
  jsonResponse,
  pageResult,
  parsePage,
  preflight,
  rpcErrorResponse,
  serverError,
} from "../_shared/http.ts";

const GUEST_ID_PATTERN = /^guest-[a-zA-Z0-9-]{1,120}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ORDER_COLUMNS =
  "id, order_no, status, total_amount, receiver_name, phone, address, detail_address, created_at, " +
  "order_items(id, product_id, option_id, quantity, price, products(name, main_image_url))";

type OrderLine = { product_id: string; option_id: string | null; quantity: number };

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** 요청 본문의 items를 검증해 RPC 입력 형태로 바꾼다. 가격은 받지 않는다(DB 값으로 계산). */
function parseItems(raw: unknown): OrderLine[] | null {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 50) return null;
  const lines: OrderLine[] = [];
  for (const entry of raw) {
    const productId = entry?.productId;
    const quantity = entry?.quantity;
    const optionId = entry?.optionId ? String(entry.optionId) : null;
    if (typeof productId !== "string" || !UUID_PATTERN.test(productId)) return null;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null;
    if (optionId && !optionId.split(",").every((id) => UUID_PATTERN.test(id))) return null;
    lines.push({ product_id: productId, option_id: optionId, quantity });
  }
  return lines;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return preflight(request);

  try {
    const supabase = getDatabaseClient();
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];

    // 비회원 주문 조회: 로그인 없이 주문번호 + 이메일 + 조회 비밀번호로만 접근한다.
    if (request.method === "POST" && last === "guest-lookup") {
      const body = await request.json().catch(() => ({}));
      const orderNo = text(body.orderNo, 50);
      const email = text(body.email, 200).toLowerCase();
      const password = typeof body.password === "string" ? body.password.slice(0, 100) : "";
      if (!orderNo || !EMAIL_PATTERN.test(email) || !password) {
        return jsonResponse(request, null, 400, "주문번호, 이메일, 조회 비밀번호를 입력해 주세요.");
      }

      // IP 원문은 DB에 남기지 않고, 서버 비밀 키로 만든 해시만 제한 판단에 쓴다.
      const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim().slice(0, 64);
      const clientKey = await hashClientKey(
        ip,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEYS") ?? "",
      );
      const { data, error } = await supabase.rpc("lookup_guest_order", {
        p_order_no: orderNo,
        p_email: email,
        p_password: password,
        p_client_key: clientKey,
      });
      if (error?.code === "P0003") {
        return jsonResponse(request, null, 429, "조회 시도가 너무 많습니다. 15분 뒤에 다시 시도해 주세요.");
      }
      if (error) return serverError(request, error);
      // 주문이 없는 경우와 정보가 틀린 경우를 구분하지 않는다.
      if (!data) return jsonResponse(request, null, 404, "일치하는 주문을 찾을 수 없습니다.");
      return jsonResponse(request, data, 200, "주문 조회 성공");
    }

    const token = bearerToken(request);
    let memberId: string | null = null;
    if (token) {
      try {
        memberId = await resolveUserIdentity(supabase, token);
      } catch {
        return jsonResponse(request, null, 401, "인증된 사용자 정보를 확인할 수 없습니다.");
      }
    } else if (request.headers.get("authorization")) {
      return jsonResponse(request, null, 401, "로그인이 필요합니다.");
    }

    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const receiverName = text(body.receiverName, 120);
      const phone = text(body.phone, 20);
      const address = text(body.address, 300);
      const detailAddress = text(body.detailAddress, 300);
      if (!receiverName || !phone || !address) {
        return jsonResponse(request, null, 400, "배송지 정보(수령인, 연락처, 주소)를 입력해 주세요.");
      }

      const items = parseItems(body.items);
      if (!items) return jsonResponse(request, null, 400, "주문 상품 정보가 올바르지 않습니다.");

      let ownerId = memberId;
      let guestEmail: string | null = null;
      let guestPassword: string | null = null;
      if (!ownerId) {
        // 비회원 장바구니 식별자는 주문 후 장바구니를 비우는 데만 쓰고, 조회 권한은 주지 않는다.
        const guestHeader = request.headers.get("x-guest-id") ?? "";
        if (!GUEST_ID_PATTERN.test(guestHeader)) {
          return jsonResponse(request, null, 401, "비회원 주문 식별 정보가 필요합니다.");
        }
        guestEmail = text(body.guestEmail, 200).toLowerCase();
        guestPassword = typeof body.guestLookupPassword === "string" ? body.guestLookupPassword : "";
        if (!EMAIL_PATTERN.test(guestEmail) || guestPassword.length < 6 || guestPassword.length > 100) {
          return jsonResponse(request, null, 400, "비회원 주문에는 이메일과 6자 이상의 조회 비밀번호가 필요합니다.");
        }
        ownerId = guestHeader;
      }

      const { data, error } = await supabase.rpc("create_order_atomic", {
        p_user_id: ownerId,
        p_receiver_name: receiverName,
        p_phone: phone,
        p_address: address,
        p_detail_address: detailAddress,
        p_items: items,
        p_guest_email: guestEmail,
        p_guest_lookup_password: guestPassword,
      });
      if (error) return rpcErrorResponse(request, error);

      return jsonResponse(request, { orderId: data.order_id, orderNo: data.order_no }, 201, "주문이 완료되었습니다.");
    }

    if (request.method === "GET") {
      if (!memberId) return jsonResponse(request, null, 401, "로그인이 필요합니다.");

      if (last === "recent-shipping") {
        const { data, error } = await supabase
          .from("orders")
          .select("receiver_name, phone, address, detail_address")
          .eq("user_id", memberId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) return serverError(request, error);
        return jsonResponse(request, data, 200, "최근 배송지 조회 성공");
      }

      if (last === "me") {
        const { page, size, from, to } = parsePage(url, 10, 50);
        const { data, count, error } = await supabase
          .from("orders")
          .select(ORDER_COLUMNS, { count: "exact" })
          .eq("user_id", memberId)
          .order("created_at", { ascending: false })
          .range(from, to);
        if (error) return serverError(request, error);
        return jsonResponse(request, pageResult(data, count, page, size), 200, "내 주문 목록 조회 성공");
      }

      if (UUID_PATTERN.test(last)) {
        const { data, error } = await supabase
          .from("orders")
          .select(ORDER_COLUMNS)
          .eq("id", last)
          .eq("user_id", memberId)
          .maybeSingle();
        if (error) return serverError(request, error);
        if (!data) return jsonResponse(request, null, 404, "주문을 찾을 수 없습니다.");
        return jsonResponse(request, data, 200, "주문 상세 조회 성공");
      }

      return jsonResponse(request, null, 400, "지원하지 않는 요청 경로입니다.");
    }

    return jsonResponse(request, null, 405, "지원하지 않는 메서드입니다.");
  } catch (error) {
    return serverError(request, error);
  }
});
