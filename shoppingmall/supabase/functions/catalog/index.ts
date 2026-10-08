import { getDatabaseClient, jsonResponse, preflight } from "../_shared/http.ts";

type ProductRow = {
  id: string;
  created_at: string | null;
  name: string;
  description: string | null;
  price: number | string;
  stock_quantity: number;
  main_image_url: string | null;
  category_id: number | null;
  categories: { name: string } | { name: string }[] | null;
  product_options: {
    id: string;
    option_type: string;
    option_name: string;
    additional_price: number | string;
    stock_quantity: number;
  }[] | null;
};

const productSelect = [
  "id",
  "name",
  "description",
  "price",
  "stock_quantity",
  "main_image_url",
  "category_id",
  "categories(name)",
  "product_options(id,option_type,option_name,additional_price,stock_quantity)",
].join(",");

function toProduct(row: ProductRow) {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    stockQuantity: row.stock_quantity,
    categoryName: category?.name ?? null,
    mainImageUrl: row.main_image_url,
    vendor: "Hjuk 공식 스토어",
    options: (row.product_options ?? []).map((option) => ({
      id: option.id,
      optionType: option.option_type,
      optionName: option.option_name,
      additionalPrice: Number(option.additional_price),
      stockQuantity: option.stock_quantity,
    })),
  };
}

function pageEnvelope<T>(content: T[], page: number, size: number, totalElements: number) {
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

function positiveInteger(value: string | null, fallback: number, maximum: number): number | null {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) return null;
  return Math.min(Number(value), maximum);
}

async function getProducts(request: Request, client: ReturnType<typeof getDatabaseClient>, categoryId?: number) {
  const url = new URL(request.url);
  const page = positiveInteger(url.searchParams.get("page"), 0, 1_000_000);
  const size = positiveInteger(url.searchParams.get("size"), 10, 100);
  if (page === null || size === null || size < 1) {
    return jsonResponse(request, null, 400, "페이지 또는 페이지 크기 값이 올바르지 않습니다.");
  }

  const minPriceRaw = url.searchParams.get("minPrice");
  const maxPriceRaw = url.searchParams.get("maxPrice");
  const minPrice = minPriceRaw === null ? null : Number(minPriceRaw);
  const maxPrice = maxPriceRaw === null ? null : Number(maxPriceRaw);
  if (
    (minPrice !== null && (!Number.isFinite(minPrice) || minPrice < 0)) ||
    (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
    (minPrice !== null && maxPrice !== null && minPrice > maxPrice)
  ) {
    return jsonResponse(request, null, 400, "가격 필터 값이 올바르지 않습니다.");
  }

  const offset = page * size;
  const sortParam = url.searchParams.get("sort")?.split(",") ?? [];
  const sortColumnMap: Record<string, string> = {
    createdAt: "created_at",
    price: "price",
    name: "name",
    stockQuantity: "stock_quantity",
  };
  const sortColumn = sortColumnMap[sortParam[0]] ?? "created_at";
  const ascending = sortParam[1]?.toLowerCase() === "asc";

  let query = client
    .from("products")
    .select(productSelect, { count: "exact" })
    .eq("status", "FOR_SALE")
    .order(sortColumn, { ascending })
    .range(offset, offset + size - 1);

  if (categoryId !== undefined) query = query.eq("category_id", categoryId);
  if (minPrice !== null) query = query.gte("price", minPrice);
  if (maxPrice !== null) query = query.lte("price", maxPrice);

  const { data, count, error } = await query;
  if (error) throw error;

  const content = ((data ?? []) as unknown as ProductRow[]).map(toProduct);
  return jsonResponse(request, pageEnvelope(content, page, size, count ?? 0));
}

async function getSearch(request: Request, client: ReturnType<typeof getDatabaseClient>) {
  const url = new URL(request.url);
  const keyword = url.searchParams.get("keyword")?.trim() ?? "";
  const page = positiveInteger(url.searchParams.get("page"), 0, 1_000_000);
  const size = positiveInteger(url.searchParams.get("size"), 10, 100);
  if (!keyword || keyword.length > 100 || page === null || size === null || size < 1) {
    return jsonResponse(request, null, 400, "검색 조건이 올바르지 않습니다.");
  }

  // PostgREST or() 필터의 구분자·와일드카드가 키워드로 들어와 조건이 바뀌지 않도록 제거한다.
  const safe = keyword.replace(/[%_,()*\\]/g, " ").trim();
  if (!safe) return jsonResponse(request, []);
  const offset = page * size;

  const { data, error } = await client
    .from("products")
    .select(productSelect)
    .eq("status", "FOR_SALE")
    .or(`name.ilike.%${safe}%,description.ilike.%${safe}%`)
    .order("created_at", { ascending: false })
    .range(offset, offset + size - 1);
  if (error) throw error;

  return jsonResponse(request, ((data ?? []) as unknown as ProductRow[]).map(toProduct));
}

async function getCategories(request: Request, client: ReturnType<typeof getDatabaseClient>) {
  const { data, error } = await client
    .from("categories")
    .select("id,name,parent_id,display_order")
    .order("display_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw error;

  type CategoryNode = {
    id: number;
    name: string;
    parentId: number | null;
    displayOrder: number;
    children: CategoryNode[];
  };
  const nodes = new Map<number, CategoryNode>();
  for (const row of data ?? []) {
    nodes.set(row.id, {
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
      displayOrder: row.display_order,
      children: [],
    });
  }

  const roots: CategoryNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId === null ? undefined : nodes.get(node.parentId);
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const toResponse = (node: CategoryNode): Record<string, unknown> => ({
    id: node.id,
    name: node.name,
    displayOrder: node.displayOrder,
    children: node.children.map(toResponse),
  });
  return jsonResponse(request, roots.map(toResponse));
}

async function route(request: Request) {
  if (request.method === "OPTIONS") return preflight(request);
  if (request.method !== "GET") return jsonResponse(request, null, 405, "허용되지 않은 HTTP 메서드입니다.");

  const client = getDatabaseClient();
  const path = new URL(request.url).pathname;
  const functionMarker = "/functions/v1/catalog";
  let routePath = path.includes(functionMarker)
    ? path.slice(path.indexOf(functionMarker) + functionMarker.length)
    : path;

  // Supabase may pass the function-relative URL as `/catalog/...` rather than
  // preserving the public `/functions/v1/catalog/...` prefix. Normalize both
  // forms so the same routes work in either runtime representation.
  if (routePath === "/catalog") routePath = "/";
  else if (routePath.startsWith("/catalog/")) routePath = routePath.slice("/catalog".length);

  if (routePath === "/categories" || routePath === "/categories/") {
    return await getCategories(request, client);
  }
  if (routePath === "/products/popular-keywords") {
    // 검색 로그를 쌓지 않으므로 집계 대신 고정 추천 검색어를 돌려준다.
    return jsonResponse(request, ["노트북", "게이밍 노트북", "무선 이어폰", "헤드폰", "태블릿", "키보드", "마우스", "후드"]);
  }
  if (routePath === "/products/trending") {
    const { data, error } = await client
      .from("products")
      .select(productSelect)
      .eq("status", "FOR_SALE")
      .order("sales_count", { ascending: false })
      .limit(10);
    if (error) throw error;
    return jsonResponse(request, ((data ?? []) as unknown as ProductRow[]).map(toProduct));
  }
  if (routePath === "/products/search") return await getSearch(request, client);
  if (routePath === "/products" || routePath === "/products/") return await getProducts(request, client);

  const categoryMatch = routePath.match(/^\/products\/category\/(\d+)\/?$/);
  if (categoryMatch) return await getProducts(request, client, Number(categoryMatch[1]));

  const detailMatch = routePath.match(/^\/products\/([0-9a-f-]{36})\/?$/i);
  if (detailMatch) {
    const { data, error } = await client
      .from("products")
      .select(productSelect)
      .eq("id", detailMatch[1])
      .neq("status", "HIDDEN")
      .maybeSingle();
    if (error) throw error;
    if (!data) return jsonResponse(request, null, 404, "상품을 찾을 수 없습니다.");
    return jsonResponse(request, toProduct(data as unknown as ProductRow));
  }

  return jsonResponse(request, null, 404, "요청한 API를 찾을 수 없습니다.");
}

Deno.serve(async (request: Request) => {
  try {
    return await route(request);
  } catch (error) {
    console.error("[catalog] request failed", error instanceof Error ? error.message : "unknown error");
    return jsonResponse(request, null, 500, "요청 처리 중 오류가 발생했습니다.");
  }
});
