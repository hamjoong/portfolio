import assert from "node:assert/strict";
import test from "node:test";
import { hashClientKey } from "./clientKey.mjs";

test("같은 IP와 비밀 키는 같은 64자리 16진수 해시를 만든다", async () => {
  const first = await hashClientKey("203.0.113.7", "secret-a");
  const second = await hashClientKey("203.0.113.7", "secret-a");
  assert.equal(first, second);
  assert.match(first, /^[0-9a-f]{64}$/);
});

test("IP나 비밀 키가 다르면 해시가 달라진다", async () => {
  const base = await hashClientKey("203.0.113.7", "secret-a");
  assert.notEqual(base, await hashClientKey("203.0.113.8", "secret-a"));
  assert.notEqual(base, await hashClientKey("203.0.113.7", "secret-b"));
});

test("해시에 IP 원문이 들어 있지 않다", async () => {
  assert.equal((await hashClientKey("203.0.113.7", "secret-a")).includes("203"), false);
});

test("비밀 키가 비어 있으면 예외를 던진다", async () => {
  await assert.rejects(() => hashClientKey("203.0.113.7", ""), /secret/);
});
