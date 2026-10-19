#!/usr/bin/env bash
# 동시 주문 테스트: create_order_atomic의 재고 정합성을 로컬 Postgres 컨테이너에서 확인한다.
# 운영 Supabase에는 접속하지 않는다. Docker가 필요하며, 컨테이너는 포트를 공개하지 않고 끝나면 삭제된다.
# 실행: shoppingmall/supabase/tests/concurrent_order_test.sh
set -euo pipefail

NAME=shoppingmall-pg-test
HERE="$(cd "$(dirname "$0")" && pwd)"
MIGRATIONS="$HERE/../migrations"
FAILED=0

cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT
cleanup

sql() { docker exec -i "$NAME" psql -U postgres -v ON_ERROR_STOP=1 -q -tA "$@"; }
check() { # 설명, 기대값, 실제값
  if [ "$2" = "$3" ]; then echo "  통과: $1 (기대=$2, 실제=$3)"; else echo "  실패: $1 (기대=$2, 실제=$3)"; FAILED=1; fi
}

echo "== 로컬 Postgres 준비"
docker run -d --name "$NAME" -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17-alpine >/dev/null
until docker exec "$NAME" pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
sleep 2
sql < "$HERE/local_stub.sql"
for f in "$MIGRATIONS"/*.sql; do
  echo "  마이그레이션: $(basename "$f")"
  sql < "$f" >/dev/null
done
sql < "$HERE/seed_concurrency.sql"
for f in pgbench_stock pgbench_option pgbench_order_ab pgbench_order_ba; do
  docker cp "$HERE/$f.sql" "$NAME:/tmp/$f.sql"
done

bench() { sql -c "TRUNCATE public.test_order_results"; docker exec "$NAME" pgbench -U postgres -n "$@" postgres | grep -E "number of transactions actually processed" || true; }
# 시도별 결과를 SQLSTATE별로 요약한다(OK=성공, P0001=재고 부족, 40P01=데드락).
summary() { sql -c "SELECT sqlstate || '=' || count(*) FROM public.test_order_results GROUP BY sqlstate ORDER BY sqlstate" | tr '\n' ' '; echo; }

echo "== 1. 재고 10, 30명이 동시에 1개씩 주문"
bench -c 30 -j 4 -t 1 -f /tmp/pgbench_stock.sql ; echo -n "  결과: "; summary
check "남은 재고" 0 "$(sql -c "SELECT stock_quantity FROM public.products WHERE id='00000000-0000-0000-0000-0000000000a1'")"
check "저장된 주문 수" 10 "$(sql -c "SELECT count(*) FROM public.orders WHERE user_id='load-stock'")"
check "주문 항목 수량 합" 10 "$(sql -c "SELECT coalesce(sum(quantity),0) FROM public.order_items WHERE product_id='00000000-0000-0000-0000-0000000000a1'")"

echo "== 2. 옵션 재고 10, 30명이 동시에 1개씩 주문"
bench -c 30 -j 4 -t 1 -f /tmp/pgbench_option.sql ; echo -n "  결과: "; summary
check "남은 옵션 재고" 0 "$(sql -c "SELECT stock_quantity FROM public.product_options WHERE id='00000000-0000-0000-0000-0000000001b1'")"
check "저장된 주문 수" 10 "$(sql -c "SELECT count(*) FROM public.orders WHERE user_id='load-option'")"
check "상품 재고(옵션 주문은 옵션 재고만 차감)" 100 "$(sql -c "SELECT stock_quantity FROM public.products WHERE id='00000000-0000-0000-0000-0000000000b1'")"

echo "== 3. 한 주문 안에서 두 번째 항목이 재고 부족이면 첫 항목도 되돌려진다"
set +e
sql -c "SET request.jwt.claim.role='service_role'; SELECT public.create_order_atomic('atomic-user','홍길동','01000000000','서울','101호','[{\"product_id\":\"00000000-0000-0000-0000-0000000000c1\",\"quantity\":1},{\"product_id\":\"00000000-0000-0000-0000-0000000000d1\",\"quantity\":1}]'::jsonb)" >/dev/null 2>&1
STATUS=$?
set -e
check "주문 함수가 실패함(종료 코드 0이 아님)" 1 "$([ "$STATUS" -ne 0 ] && echo 1 || echo 0)"
check "첫 항목 재고가 그대로" 5 "$(sql -c "SELECT stock_quantity FROM public.products WHERE id='00000000-0000-0000-0000-0000000000c1'")"
check "저장된 주문 수" 0 "$(sql -c "SELECT count(*) FROM public.orders WHERE user_id='atomic-user'")"

echo "== 4. 항목 순서가 서로 반대인 주문(A,B / B,A)이 동시에 들어올 때"
bench -c 20 -j 4 -t 20 -f /tmp/pgbench_order_ab.sql@1 -f /tmp/pgbench_order_ba.sql@1 ; echo -n "  결과: "; summary
ORDERS=$(sql -c "SELECT count(*) FROM public.orders WHERE user_id='load-ab'")
check "주문이 실제로 저장됨(0건이면 테스트가 무의미)" 1 "$([ "$ORDERS" -gt 0 ] && echo 1 || echo 0)"
check "상품 A 재고 = 1000 - 저장된 주문 수" "$((1000 - ORDERS))" "$(sql -c "SELECT stock_quantity FROM public.products WHERE id='00000000-0000-0000-0000-0000000000e1'")"
check "상품 B 재고 = 1000 - 저장된 주문 수" "$((1000 - ORDERS))" "$(sql -c "SELECT stock_quantity FROM public.products WHERE id='00000000-0000-0000-0000-0000000000e2'")"
echo "  저장된 주문 수: $ORDERS / 시도 400건 (차이는 데드락 등으로 실패한 건수)"

if [ "$FAILED" -eq 0 ]; then echo "== 전체 결과: 통과"; else echo "== 전체 결과: 실패"; exit 1; fi
