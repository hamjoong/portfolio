import { isAdminRequest } from "../_shared/adminAuthorization.mjs";
import { getDatabaseClient, jsonResponse, preflight } from "../_shared/http.ts";

function positiveInteger(value: string | null, fallback: number, max: number) {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= max ? parsed : null;
}

// 본문이 너무 크거나 JSON이 아닌 것은 서버 오류가 아니라 잘못된 요청이므로, 아래 catch가 400으로 바꾸는 22023 코드를 붙인다.
function badRequest(message: string) {
  return Object.assign(new Error(message), { code: "22023" });
}

async function readJson(request: Request) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > 64 * 1024) {
    throw badRequest("상품 요청 본문은 64 KiB 이하여야 합니다.");
  }
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > 64 * 1024) {
    throw badRequest("상품 요청 본문은 64 KiB 이하여야 합니다.");
  }
  try {
    return JSON.parse(body);
  } catch {
    throw badRequest("상품 요청 본문이 올바른 JSON이 아닙니다.");
  }
}

function toProduct(row: any) {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    stockQuantity: row.stock_quantity,
    categoryName: category?.name ?? null,
    mainImageUrl: row.main_image_url,
    vendor: "Hjuk 공식 스토어",
    options: (row.product_options ?? []).map((option: any) => ({
      id: option.id,
      optionType: option.option_type,
      optionName: option.option_name,
      additionalPrice: Number(option.additional_price),
      stockQuantity: option.stock_quantity,
    })),
  };
}

function adminPage<T>(content: T[], page: number, size: number, totalElements: number) {
  const totalPages = Math.ceil(totalElements / size);
  return {
    content,
    pageable: { pageNumber: page, pageSize: size, offset: page * size, paged: true, unpaged: false },
    totalElements,
    totalPages,
    last: page + 1 >= totalPages,
    size,
    number: page,
    sort: { sorted: false, unsorted: true, empty: true },
    numberOfElements: content.length,
    first: page === 0,
    empty: content.length === 0,
  };
}

async function getAdminUserId(supabase: ReturnType<typeof getDatabaseClient>, authorization: string) {
  const { data, error } = await supabase.auth.getUser(authorization.slice(7).trim());
  if (error || !data.user?.id) throw new Error("인증된 Supabase 사용자를 확인할 수 없습니다.");
  return data.user.id;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return preflight(request);

  try {
    const supabase = getDatabaseClient();
    const authorization = request.headers.get("authorization") ?? "";
    if (!await isAdminRequest(supabase, authorization)) {
      return jsonResponse(request, null, 403, "관리자 권한이 필요합니다.");
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");
    if (request.method === "GET" && path.endsWith("/access")) {
      return jsonResponse(request, true, 200, "관리자 권한 확인 성공");
    }
    if (request.method === "GET" && path.endsWith("/stats")) {
      const { data, error } = await supabase.rpc("admin_dashboard_stats", {
        p_auth_user_id: await getAdminUserId(supabase, authorization),
      });
      if (error) throw error;
      return jsonResponse(request, data, 200, "대시보드 통계 조회 성공");
    }
    if (request.method === "GET" && path.endsWith("/users")) {
      const page = positiveInteger(url.searchParams.get("page"), 0, 1_000_000);
      const size = positiveInteger(url.searchParams.get("size"), 20, 100);
      if (page === null || size === null || size < 1) {
        return jsonResponse(request, null, 400, "페이지 값이 올바르지 않습니다.");
      }

      const { data: stats, error: statsError } = await supabase.rpc("admin_dashboard_stats", {
        p_auth_user_id: await getAdminUserId(supabase, authorization),
      });
      if (statsError) throw statsError;

      const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers({
        page: page + 1,
        perPage: size,
      });
      if (usersError) throw usersError;
      const userIds = authUsers.users.map((user) => user.id);
      const [profilesResult, adminsResult] = userIds.length
        ? await Promise.all([
          supabase.from("customer_profiles").select("auth_user_id,full_name").in("auth_user_id", userIds),
          supabase.from("admin_users").select("auth_user_id").in("auth_user_id", userIds),
        ])
        : [{ data: [], error: null }, { data: [], error: null }];
      if (profilesResult.error) throw profilesResult.error;
      if (adminsResult.error) throw adminsResult.error;

      const profiles = new Map<string, string>(
        (profilesResult.data ?? []).map((profile) => [profile.auth_user_id, profile.full_name]),
      );
      const adminIds = new Set((adminsResult.data ?? []).map((admin) => admin.auth_user_id));
      const content = authUsers.users.map((user) => ({
        id: user.id,
        email: user.email ?? "",
        role: adminIds.has(user.id) ? "ROLE_ADMIN" : "ROLE_USER",
        status: user.banned_until && Date.parse(user.banned_until) > Date.now() ? "BLOCKED" : "ACTIVE",
        createdAt: user.created_at,
        lastLoginAt: user.last_sign_in_at ?? null,
        fullName: profiles.get(user.id) ?? "",
      }));
      return jsonResponse(
        request,
        adminPage(content, page, size, Number(stats.totalUsers)),
        200,
        "사용자 목록 조회 성공",
      );
    }
    if (request.method === "GET" && path.endsWith("/orders")) {
      const page = positiveInteger(url.searchParams.get("page"), 0, 1_000_000);
      const size = positiveInteger(url.searchParams.get("size"), 20, 100);
      if (page === null || size === null || size < 1) {
        return jsonResponse(request, null, 400, "페이지 값이 올바르지 않습니다.");
      }

      const from = page * size;
      const { data, count, error } = await supabase
        .from("orders")
        .select(
          "id,order_no,total_amount,status,receiver_name,phone,address,detail_address,created_at,order_items(product_id,quantity,price,products(name,main_image_url))",
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(from, from + size - 1);
      if (error) throw error;

      const content = (data ?? []).map((order) => ({
        id: order.id,
        orderNo: order.order_no,
        totalAmount: Number(order.total_amount),
        status: order.status,
        receiverName: order.receiver_name,
        phone: order.phone,
        address: order.address,
        detailAddress: order.detail_address,
        createdAt: order.created_at,
        orderItems: (order.order_items ?? []).map((item) => {
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          return {
            productId: item.product_id,
            productName: product?.name ?? "삭제된 상품",
            quantity: item.quantity,
            price: Number(item.price),
            imageUrl: product?.main_image_url ?? undefined,
          };
        }),
      }));
      return jsonResponse(
        request,
        adminPage(content, page, size, count ?? 0),
        200,
        "주문 목록 조회 성공",
      );
    }
    const orderStatusRoute = path.match(
      /(?:^|\/)orders\/([0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12})\/status$/i,
    );
    if (request.method === "PATCH" && orderStatusRoute) {
      const status = url.searchParams.get("status");
      const { error } = await supabase.rpc("admin_update_order_status", {
        p_auth_user_id: await getAdminUserId(supabase, authorization),
        p_order_id: orderStatusRoute[1],
        p_status: status,
      });
      if (error) throw error;
      return jsonResponse(request, null, 200, "주문 상태가 변경되었습니다.");
    }
    const productRoute = path.match(/(?:^|\/)products(?:\/([0-9a-f-]{36}))?$/i);

    if (!productRoute) return jsonResponse(request, null, 404, "지원하지 않는 관리자 경로입니다.");

    if (request.method === "GET" && productRoute[1]) {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,description,price,stock_quantity,main_image_url,categories(name),product_options(id,option_type,option_name,additional_price,stock_quantity)")
        .eq("id", productRoute[1])
        .maybeSingle();
      if (error) throw error;
      if (!data) return jsonResponse(request, null, 404, "상품을 찾을 수 없습니다.");
      return jsonResponse(request, toProduct(data), 200, "상품 조회 성공");
    }

    if (request.method === "GET" && !productRoute[1]) {
      const page = positiveInteger(url.searchParams.get("page"), 0, 1_000_000);
      const size = positiveInteger(url.searchParams.get("size"), 20, 100);
      if (page === null || size === null || size < 1) {
        return jsonResponse(request, null, 400, "페이지 값이 올바르지 않습니다.");
      }

      const from = page * size;
      const { data, count, error } = await supabase
        .from("products")
        .select("id,name,description,price,stock_quantity,main_image_url,categories(name),product_options(id,option_type,option_name,additional_price,stock_quantity)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, from + size - 1);
      if (error) throw error;

      const content = (data ?? []).map(toProduct);
      const totalElements = count ?? 0;
      const totalPages = Math.ceil(totalElements / size);
      return jsonResponse(request, {
        content,
        pageable: { pageNumber: page, pageSize: size, offset: from, paged: true, unpaged: false },
        totalElements,
        totalPages,
        last: page + 1 >= totalPages,
        size,
        number: page,
        sort: { sorted: false, unsorted: true, empty: true },
        numberOfElements: content.length,
        first: page === 0,
        empty: content.length === 0,
      }, 200, "상품 목록 조회 성공");
    }

    if (request.method === "POST" && !productRoute[1]) {
      const body = await readJson(request);
      const { data, error } = await supabase.rpc("admin_save_product", {
        p_auth_user_id: await getAdminUserId(supabase, authorization),
        p_product_id: null,
        p_product: body,
      });
      if (error) throw error;
      return jsonResponse(request, data, 201, "상품이 등록되었습니다.");
    }

    if (request.method === "PUT" && productRoute[1]) {
      const body = await readJson(request);
      const { data, error } = await supabase.rpc("admin_save_product", {
        p_auth_user_id: await getAdminUserId(supabase, authorization),
        p_product_id: productRoute[1],
        p_product: body,
      });
      if (error) throw error;
      return jsonResponse(request, data, 200, "상품이 수정되었습니다.");
    }

    if (request.method === "DELETE" && productRoute[1]) {
      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", productRoute[1])
        .select("id")
        .maybeSingle();
      if (error?.code === "23503") return jsonResponse(request, null, 409, "주문에 포함된 상품은 삭제할 수 없습니다.");
      if (error) throw error;
      if (!data) return jsonResponse(request, null, 404, "상품을 찾을 수 없습니다.");
      return jsonResponse(request, null, 200, "상품이 삭제되었습니다.");
    }

    return jsonResponse(request, null, 405, "지원하지 않는 HTTP 메서드입니다.");
  } catch (error) {
    // DB 오류 원문은 로그에만 남기고, 응답에는 오류 종류별 고정 문구만 보낸다.
    console.error("[admin-products] request failed", error);
    const code = (error as { code?: string })?.code;
    const known: Record<string, [number, string]> = {
      "42501": [403, "관리자 권한이 필요합니다."],
      P0002: [404, "대상을 찾을 수 없습니다."],
      "23503": [409, "다른 데이터에서 참조 중이라 처리할 수 없습니다."],
      "22023": [400, "요청 값이 올바르지 않습니다."],
    };
    const [status, message] = (code && known[code]) || [500, "서버 오류가 발생했습니다."];
    return jsonResponse(request, null, status, message);
  }
});
