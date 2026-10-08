import { createClient } from "npm:@supabase/supabase-js@2";

// 배포 도메인은 ALLOWED_ORIGINS(쉼표 구분)로 지정한다. 프리뷰 도메인을 정규식으로 열어 두면
// 남의 Vercel 프로젝트가 같은 패턴으로 만들어져도 통과하므로, 정확히 일치하는 origin만 허용한다.
const DEFAULT_ORIGINS = ["http://localhost:3000"];

function allowedOrigins(): Set<string> {
  const configured = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ORIGINS, ...configured]);
}

export function corsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get("origin") ?? "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-guest-id",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Vary": "Origin",
  };
  if (allowedOrigins().has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export function preflight(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export function jsonResponse(
  request: Request,
  data: unknown,
  status = 200,
  message = "요청이 성공적으로 처리되었습니다.",
) {
  return Response.json(
    { timestamp: new Date().toISOString(), success: status >= 200 && status < 300, message, data },
    { status, headers: corsHeaders(request) },
  );
}

/** DB 오류의 원문(테이블·제약 이름 등)은 사용자에게 보여주지 않고 서버 로그에만 남긴다. */
export function serverError(request: Request, error: unknown) {
  console.error(error);
  return jsonResponse(request, null, 500, "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
}

// RPC가 던지는 SQLSTATE 중 사용자에게 의미 있는 것만 한국어 메시지로 바꾼다.
const RPC_ERRORS: Record<string, [number, string]> = {
  P0001: [409, "재고가 부족하거나 판매 중이 아닌 상품이 있습니다."],
  P0002: [404, "존재하지 않는 상품 또는 옵션이 있습니다."],
  "22023": [400, "요청 값이 올바르지 않습니다."],
  "22P02": [400, "요청 값의 형식이 올바르지 않습니다."],
};

export function rpcErrorResponse(request: Request, error: { code?: string }) {
  const known = error.code ? RPC_ERRORS[error.code] : undefined;
  if (!known) return serverError(request, error);
  return jsonResponse(request, null, known[0], known[1]);
}

export function getDatabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKeysJson = Deno.env.get("SUPABASE_SECRET_KEYS");
  let secretKey: string | undefined;

  if (secretKeysJson) {
    try {
      secretKey = JSON.parse(secretKeysJson).default;
    } catch {
      throw new Error("Supabase secret key environment is not valid JSON");
    }
  }

  secretKey ??= Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !secretKey) {
    throw new Error("Supabase server environment is incomplete");
  }

  return createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** page는 0부터 시작한다. size는 상한을 두어 한 번에 전체 테이블을 읽는 요청을 막는다. */
export function parsePage(url: URL, defaultSize = 10, maxSize = 50) {
  const rawPage = Number.parseInt(url.searchParams.get("page") ?? "0", 10);
  const rawSize = Number.parseInt(url.searchParams.get("size") ?? String(defaultSize), 10);
  const page = Number.isFinite(rawPage) && rawPage >= 0 ? rawPage : 0;
  const size = Number.isFinite(rawSize) && rawSize > 0 ? Math.min(rawSize, maxSize) : defaultSize;
  const from = page * size;
  return { page, size, from, to: from + size - 1 };
}

export function pageResult<T>(rows: T[] | null, count: number | null, page: number, size: number) {
  const total = count ?? 0;
  return {
    content: rows ?? [],
    pageable: { pageNumber: page, pageSize: size },
    totalElements: total,
    totalPages: Math.ceil(total / size),
    last: (page + 1) * size >= total,
  };
}

/** 로그인 사용자의 Bearer 토큰만 꺼낸다. 형식이 틀리면 null. */
export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}
