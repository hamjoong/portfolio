/**
 * 조회 시도 제한에 쓰는 접속 식별자를 만든다.
 * IP 원문을 DB에 남기지 않으려고 서버 비밀 키로 HMAC-SHA256을 계산한 값만 저장한다.
 * 비밀 키가 있어야 해시를 만들 수 있어, 해시만 보고 IPv4를 전수 대입해 되돌리기 어렵다.
 */
export async function hashClientKey(ip, secret) {
  if (!secret) throw new Error("client key secret is required");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`ip:${ip}`));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
