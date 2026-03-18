-- [이유] 자주 검색되는 컬럼과 조인 조건에 인덱스를 생성하여 
-- 데이터량이 늘어나도 200ms 이내의 탐색 속도를 보장하기 위함입니다.

-- 1. 상품 검색 성능 최적화 (상품명, 카테고리, 상태)
CREATE INDEX idx_product_name_status ON product.products (name, status);
CREATE INDEX idx_product_category_status ON product.products (category_id, status);

-- 2. 주문 조회 성능 최적화 (사용자별 최신 주문순)
CREATE INDEX idx_order_user_id_created ON "order".orders (user_id, created_at DESC);

-- 3. 아웃박스 폴링 성능 최적화
CREATE INDEX idx_outbox_status_created ON "order".outbox_events (status, created_at);
