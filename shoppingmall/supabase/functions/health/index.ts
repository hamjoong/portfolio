import { corsHeaders, preflight } from "../_shared/http.ts";

Deno.serve((request: Request) => {
  if (request.method === "OPTIONS") return preflight(request);

  if (request.method !== "GET") {
    return Response.json(
      { success: false, message: "Method not allowed" },
      { status: 405, headers: corsHeaders(request) },
    );
  }

  return Response.json(
    { success: true, data: { service: "shoppingmall-edge", status: "ready" } },
    { headers: corsHeaders(request) },
  );
});
