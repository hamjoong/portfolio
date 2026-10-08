import assert from "node:assert/strict";
import test from "node:test";
import { isAdminRequest } from "./adminAuthorization.mjs";

const authUserId = "11111111-1111-4111-8111-111111111111";

function supabaseClient({ user = { id: authUserId }, authError = null, admin = null, adminError = null } = {}) {
  return {
    auth: {
      getUser: async () => ({ data: { user }, error: authError }),
    },
    from: (table) => {
      assert.equal(table, "admin_users");
      return {
        select: (columns) => {
          assert.equal(columns, "auth_user_id");
          return {
            eq: (column, value) => {
              assert.equal(column, "auth_user_id");
              assert.equal(value, user?.id);
              return {
                maybeSingle: async () => ({ data: admin, error: adminError }),
              };
            },
          };
        },
      };
    },
  };
}

test("관리자 허용 목록(admin_users)에 있어야 관리자로 인정한다", async () => {
  const authorized = await isAdminRequest(
    supabaseClient({ admin: { auth_user_id: authUserId } }),
    "Bearer supabase-token",
  );
  const denied = await isAdminRequest(supabaseClient(), "Bearer supabase-token");

  assert.equal(authorized, true);
  assert.equal(denied, false);
});

test("유효하지 않은 세션은 관리자로 인정하지 않는다", async () => {
  const authorized = await isAdminRequest(
    supabaseClient({ user: null, authError: new Error("invalid token") }),
    "Bearer invalid-token",
  );

  assert.equal(authorized, false);
});

test("Bearer 형식이 아니면 거절한다", async () => {
  assert.equal(await isAdminRequest(supabaseClient(), "supabase-token"), false);
  assert.equal(await isAdminRequest(supabaseClient(), "Bearer "), false);
  assert.equal(await isAdminRequest(supabaseClient(), undefined), false);
});

test("허용 목록 조회가 실패하면 거절하는 쪽으로 실패한다(fail closed)", async () => {
  await assert.rejects(
    isAdminRequest(
      supabaseClient({ adminError: new Error("database unavailable") }),
      "Bearer supabase-token",
    ),
    /관리자 권한을 확인하지 못했습니다/,
  );
});
