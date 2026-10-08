import assert from "node:assert/strict";
import test from "node:test";
import { resolveUserIdentity } from "./userIdentity.mjs";

const authUserId = "11111111-1111-4111-8111-111111111111";

function authClient({ user = { id: authUserId }, authError = null } = {}) {
  return {
    auth: {
      getUser: async () => ({ data: { user }, error: authError }),
    },
  };
}

test("유효한 토큰이면 Auth UID를 반환한다", async () => {
  assert.equal(await resolveUserIdentity(authClient(), "supabase-token"), authUserId);
});

test("토큰 검증 오류면 예외를 던진다", async () => {
  await assert.rejects(
    resolveUserIdentity(authClient({ user: null, authError: new Error("invalid") }), "bad-token"),
    /확인할 수 없습니다/,
  );
});

test("사용자 정보가 없으면 예외를 던진다", async () => {
  await assert.rejects(resolveUserIdentity(authClient({ user: null }), "token"), /확인할 수 없습니다/);
});
