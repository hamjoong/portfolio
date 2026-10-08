-- 데모 카탈로그 시드: 디지털/가전 중심 16개 상품과 옵션, 리뷰, Q&A
-- 사용법: Supabase 대시보드 SQL Editor에서 한 번 실행한다. 여러 번 실행해도 중복되지 않는다(고정 UUID + ON CONFLICT).
-- 리뷰·Q&A의 user_id는 외래키가 없는 텍스트라 가짜 계정을 만들지 않고 'seed-user-N' 문자열을 쓴다. 작성자 ID는 공개 목록에 나가지 않는다.
-- 이미지는 images.unsplash.com 사진이며 next.config.js의 허용 도메인이다. 각 사진은 상품과 맞는지 직접 확인했다.
-- 상품 설명의 사양·성능은 데모용 가상 값이다.
BEGIN;

INSERT INTO public.categories (id, name, parent_id, display_order) OVERRIDING SYSTEM VALUE VALUES
  (1, '디지털/가전', NULL, 1),
  (2, '패션의류', NULL, 2),
  (3, '리빙/인테리어', NULL, 3),
  (13, '노트북/PC', 1, 0),
  (4, '모바일', 1, 1),
  (5, '음향기기', 1, 2),
  (6, 'PC주변기기', 1, 3),
  (7, '남성유니섹스', 2, 1),
  (10, '가구', 3, 1),
  (11, '침구', 3, 2),
  (12, '조명', 3, 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, parent_id = EXCLUDED.parent_id, display_order = EXCLUDED.display_order;
SELECT setval(pg_get_serial_sequence('public.categories', 'id'), GREATEST((SELECT max(id) FROM public.categories), 1));

INSERT INTO public.products (id, category_id, name, description, price, stock_quantity, main_image_url, sales_count, view_count, status) VALUES
  ('326d449b-86de-5c16-bdab-2669c74dff03', 13, '14형 경량 노트북 (1.2kg)', '무게 1.2kg의 14형 노트북입니다. 문서 작업과 강의 수강, 가벼운 개발 환경에 맞춘 구성이며 한 번 충전으로 약 12시간 사용할 수 있습니다. 백라이트 키보드와 USB-C 충전을 지원합니다.', 1290000, 40, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', 182, 2410, 'FOR_SALE'),
  ('10a7cbcd-fb3f-58cd-b4d3-f58a3f1eac49', 13, '13.5형 울트라슬림 노트북 (터치스크린)', '3:2 비율 13.5형 터치스크린을 쓴 슬림 노트북입니다. 세로로 넓은 화면이라 문서와 웹 서핑에 편하고, 알루미늄 바디의 두께는 14mm입니다. 터치와 펜 입력을 지원합니다.', 1590000, 28, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80', 121, 1890, 'FOR_SALE'),
  ('3a717dfa-3a60-537d-8369-42ba8bee48c3', 13, '16형 크리에이터 노트북 (OLED·RTX)', '16형 OLED 디스플레이와 외장 그래픽을 갖춘 노트북입니다. 영상 편집, 사진 보정, 3D 작업에 맞춘 구성이며 색 재현율이 넓은 패널이라 어두운 장면의 표현이 좋습니다. 쿨링 팬이 두 개라 장시간 렌더링에도 성능이 유지됩니다.', 2390000, 16, 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80', 74, 1520, 'FOR_SALE'),
  ('6897a1cb-c6b8-5602-9912-9a86a05121b0', 13, '17형 게이밍 노트북 (RGB 키보드)', '17형 165Hz 디스플레이와 RGB 백라이트 키보드를 갖춘 게이밍 노트북입니다. 외장 그래픽으로 최신 게임을 높은 옵션에서 실행할 수 있고, 키보드 조명은 키별로 설정할 수 있습니다.', 2190000, 14, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80', 96, 2010, 'FOR_SALE'),
  ('e3f51223-acce-5666-8ffa-aa40cb148c4c', 4, '6.1형 스마트폰 (듀얼 카메라)', '6.1형 OLED 화면과 듀얼 카메라를 갖춘 스마트폰입니다. 한 손으로 쓰기 좋은 크기에 하루 종일 가는 배터리를 담았고, 방수·방진을 지원합니다.', 890000, 60, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', 210, 3120, 'FOR_SALE'),
  ('e9729f0c-089c-5dcd-9d8c-aad6d2763def', 4, '11형 태블릿 (스타일러스 지원)', '11형 120Hz 화면의 태블릿입니다. 필기와 드로잉, 영상 시청에 맞춘 구성이며 스타일러스를 지원합니다. 강의 필기용으로 쓰는 분들이 많이 찾는 제품입니다.', 690000, 35, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', 88, 1470, 'FOR_SALE'),
  ('f00d56c4-2728-5134-b94e-88e00e51af57', 5, '노이즈 캔슬링 무선 이어폰', '액티브 노이즈 캔슬링을 지원하는 완전 무선 이어폰입니다. 이어폰 단독으로 6시간, 충전 케이스를 포함해 24시간 사용할 수 있고, 투명 모드로 주변 소리를 들을 수 있습니다.', 189000, 80, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', 260, 3380, 'FOR_SALE'),
  ('fe930caa-ec54-5ca2-93ac-a76e06e8a969', 5, '오버이어 블루투스 헤드폰', '40mm 드라이버를 쓴 오버이어 블루투스 헤드폰입니다. 귀를 완전히 감싸는 이어패드로 저음이 풍부하고, 접이식이라 휴대하기 좋습니다. 최대 30시간 재생됩니다.', 259000, 45, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 134, 1960, 'FOR_SALE'),
  ('2fc26e25-0d78-5772-9afa-2071e301f04a', 5, '유선 온이어 헤드폰 (레트로 가죽)', '가죽 이어패드와 알루미늄 하우징으로 만든 유선 온이어 헤드폰입니다. 무선 연결 없이 음질에 집중한 구성으로 보컬이 또렷합니다. 케이블은 분리할 수 있습니다.', 129000, 30, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80', 58, 980, 'FOR_SALE'),
  ('22a5719b-8140-54a7-a041-65ceb7c6bb00', 6, '무선 게이밍 마우스 (경량 63g)', '무게 63g의 경량 무선 마우스입니다. 최대 26,000 DPI 센서와 2.4GHz 무선 연결을 지원하고, 한 번 충전으로 약 70시간 사용합니다. 좌우 대칭 형태라 양손잡이도 쓸 수 있습니다.', 79000, 70, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', 167, 2250, 'FOR_SALE'),
  ('860a3998-bd7c-51d4-97f9-3aed7915a18b', 6, '무선 슬림 키보드 (저소음)', '낮은 키 높이의 무선 슬림 키보드입니다. 저소음 키 스위치라 사무실이나 도서관에서도 쓰기 좋고, 블루투스로 3대까지 기기를 전환할 수 있습니다. 한글 각인 모델입니다.', 69000, 55, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 112, 1620, 'FOR_SALE'),
  ('9e30e598-374b-5b8b-a952-a29dc8bad92f', 7, '오버핏 후드 집업 (그레이)', '기모 안감이 있는 오버핏 후드 집업입니다. 두께감이 있어 가을과 초겨울에 입기 좋고, 남녀 구분 없이 입는 유니섹스 핏입니다. 면 80%, 폴리에스터 20%입니다.', 59000, 90, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80', 143, 1740, 'FOR_SALE'),
  ('3fc08544-f0fc-5a8e-b383-f016f624a8b6', 7, '그래픽 프린트 반팔 티셔츠 (샌드)', '샌드 컬러 면 티셔츠에 일러스트를 프린트한 반팔 티셔츠입니다. 부드러운 20수 면 소재이고 세탁 후에도 프린트가 잘 유지됩니다. 정사이즈에 가까운 레귤러 핏입니다.', 29000, 120, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80', 98, 1210, 'FOR_SALE'),
  ('1557db50-5f29-558c-b008-cdbaf9adc9da', 10, '3인 벨벳 소파 (딥그린)', '부드러운 벨벳 원단을 씌운 3인용 소파입니다. 원목 다리와 두툼한 쿠션으로 안정감이 있고, 폭은 2,000mm입니다. 기본 구성은 소파 본체와 등받이 쿠션 2개입니다.', 690000, 12, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', 37, 1130, 'FOR_SALE'),
  ('34d61a83-9231-5cb7-9c27-0a50c662f49d', 12, '헤드형 스탠드 조명 (다크그레이)', '각도를 자유롭게 바꿀 수 있는 헤드가 달린 스탠드 조명입니다. 높이 1.4m로 소파나 책상 옆에 두기 좋고, 별도 LED 전구를 끼워 쓰는 방식이라 원하는 색온도를 고를 수 있습니다.', 69000, 40, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', 66, 890, 'FOR_SALE'),
  ('d7d92770-1d14-541a-9b43-0866e1aebb6b', 11, '워싱 코튼 침구 세트 (이불+베개커버)', '워싱 가공한 면 100% 침구 세트입니다. 세탁할수록 부드러워지는 소재이고, 이불 커버 1장과 베개 커버 2장으로 구성됩니다. 사계절 사용할 수 있는 두께입니다.', 119000, 50, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', 84, 1040, 'FOR_SALE')
ON CONFLICT (id) DO UPDATE SET category_id = EXCLUDED.category_id, name = EXCLUDED.name, description = EXCLUDED.description,
  price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity, main_image_url = EXCLUDED.main_image_url, status = 'FOR_SALE';

INSERT INTO public.product_options (id, product_id, option_type, option_name, additional_price, stock_quantity) VALUES
  ('ff8976f1-dec1-564c-8ea8-5204a828beb8', '326d449b-86de-5c16-bdab-2669c74dff03', '메모리/저장', '16GB / 512GB SSD', 0, 25),
  ('322eab63-3b2c-5937-9b39-7d879e2daf7d', '326d449b-86de-5c16-bdab-2669c74dff03', '메모리/저장', '16GB / 1TB SSD', 150000, 15),
  ('2e013493-5ef6-5708-a3e0-f88b216bf1b0', '10a7cbcd-fb3f-58cd-b4d3-f58a3f1eac49', '메모리/저장', '16GB / 512GB SSD', 0, 18),
  ('514d0863-2c55-5dc9-a856-b9c497893f61', '10a7cbcd-fb3f-58cd-b4d3-f58a3f1eac49', '메모리/저장', '32GB / 1TB SSD', 380000, 10),
  ('3301ce76-16cf-5e35-96a0-0c12a6197fb9', '3a717dfa-3a60-537d-8369-42ba8bee48c3', '메모리/저장', '32GB / 1TB SSD', 0, 10),
  ('77dbdb73-8b98-51ac-89c7-2955a0e724b1', '3a717dfa-3a60-537d-8369-42ba8bee48c3', '메모리/저장', '64GB / 2TB SSD', 620000, 6),
  ('4aaed532-9448-5af7-aa91-101a548970fa', '6897a1cb-c6b8-5602-9912-9a86a05121b0', '메모리/저장', '16GB / 512GB SSD', 0, 8),
  ('6dbace61-5d33-5b39-bf49-2c357f9733b1', '6897a1cb-c6b8-5602-9912-9a86a05121b0', '메모리/저장', '32GB / 1TB SSD', 330000, 6),
  ('f4f0abe2-1944-5d06-a1cb-46823b4b4440', 'e3f51223-acce-5666-8ffa-aa40cb148c4c', '저장용량', '128GB', 0, 30),
  ('38ec71b9-f0c2-526a-94f8-21228cd2b61f', 'e3f51223-acce-5666-8ffa-aa40cb148c4c', '저장용량', '256GB', 100000, 30),
  ('5950e171-8209-59ad-890c-a7b683651b43', 'e9729f0c-089c-5dcd-9d8c-aad6d2763def', '저장용량', '128GB', 0, 20),
  ('8ed929a1-6503-5369-828e-4e96156467fa', 'e9729f0c-089c-5dcd-9d8c-aad6d2763def', '저장용량', '256GB', 120000, 15),
  ('5312b05e-fa31-5a14-a23c-45b25762d6a0', '9e30e598-374b-5b8b-a952-a29dc8bad92f', '사이즈', 'M', 0, 30),
  ('d70cdb2a-4d20-55db-b9f6-b07427af1fa2', '9e30e598-374b-5b8b-a952-a29dc8bad92f', '사이즈', 'L', 0, 35),
  ('848dc406-b4f2-56d0-8ff8-244781f1568f', '9e30e598-374b-5b8b-a952-a29dc8bad92f', '사이즈', 'XL', 0, 25),
  ('0eabf20d-9d36-56e7-aac2-4fed0849375d', '3fc08544-f0fc-5a8e-b383-f016f624a8b6', '사이즈', 'M', 0, 40),
  ('fa090809-7f5c-52ee-933b-05b25dafd39f', '3fc08544-f0fc-5a8e-b383-f016f624a8b6', '사이즈', 'L', 0, 45),
  ('2c65f178-90e6-547f-9670-4156f8de04ff', '3fc08544-f0fc-5a8e-b383-f016f624a8b6', '사이즈', 'XL', 0, 35),
  ('bbc64e74-b212-57c7-8cf7-d9fdf9790c14', '34d61a83-9231-5cb7-9c27-0a50c662f49d', '전구', '전구색(따뜻한 빛)', 0, 25),
  ('dfcda4ba-b445-533d-97f9-9cfeec45e6ec', '34d61a83-9231-5cb7-9c27-0a50c662f49d', '전구', '주백색(자연광)', 0, 25),
  ('f14707c6-f4e1-58f6-a724-291c5a618fef', 'd7d92770-1d14-541a-9b43-0866e1aebb6b', '사이즈', '퀸', 0, 30),
  ('f552ce08-56f1-58c2-a338-daf271ee8251', 'd7d92770-1d14-541a-9b43-0866e1aebb6b', '사이즈', '킹', 20000, 20)
ON CONFLICT (id) DO UPDATE SET option_type = EXCLUDED.option_type, option_name = EXCLUDED.option_name, additional_price = EXCLUDED.additional_price, stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO public.reviews (id, user_id, product_id, rating, content, admin_reply, replied_at, created_at) VALUES
  ('35c41bf6-5399-5c39-b527-00d0aad50a9e', 'seed-user-1', '326d449b-86de-5c16-bdab-2669c74dff03', 5, '가방에 넣고 다니기 부담이 없는 무게입니다. 카페에서 하루 종일 쓰고도 배터리가 남았어요.', NULL, NULL, now() - interval '7 days'),
  ('d802abf9-7981-57f4-8fec-4f5573259fbe', 'seed-user-2', '326d449b-86de-5c16-bdab-2669c74dff03', 4, '키보드 타건감이 좋고 화면이 밝습니다. 팬 소음은 거의 없는데 고사양 작업은 느려지는 편입니다.', '가벼운 작업에 맞춘 모델이라 고사양 작업에는 크리에이터 노트북을 권장드립니다. 후기 감사합니다.', now() - interval '4 days', now() - interval '9 days'),
  ('63e21e15-2ab5-5ee0-b521-0a0ebbaafa33', 'seed-user-5', '10a7cbcd-fb3f-58cd-b4d3-f58a3f1eac49', 5, '3:2 화면이라 코드와 문서를 볼 때 스크롤이 확실히 줄었습니다. 터치스크린도 생각보다 자주 씁니다.', NULL, NULL, now() - interval '15 days'),
  ('2d7f8a67-1d9d-5e20-b7a6-4b0809caa95a', 'seed-user-6', '10a7cbcd-fb3f-58cd-b4d3-f58a3f1eac49', 4, '디자인과 마감이 좋습니다. 포트가 USB-C 위주라 허브를 같이 샀어요.', NULL, NULL, now() - interval '17 days'),
  ('047545af-2064-515e-8bc2-2e5b07fefea4', 'seed-user-8', '3a717dfa-3a60-537d-8369-42ba8bee48c3', 5, 'OLED 화면이 정말 선명합니다. 영상 렌더링도 이전 노트북보다 절반 정도 걸려요.', NULL, NULL, now() - interval '21 days'),
  ('7919f071-4884-52ad-a7c7-374b3a55c946', 'seed-user-9', '3a717dfa-3a60-537d-8369-42ba8bee48c3', 4, '성능은 만족하지만 어댑터가 무거워서 외출용으로는 부담됩니다. 배터리는 렌더링할 때 2시간 정도 갑니다.', '고성능 모델 특성상 어댑터가 큰 점 양해 부탁드립니다. 후기 감사합니다.', now() - interval '4 days', now() - interval '23 days'),
  ('971a5bad-1560-53b9-b01b-100db1b0bd60', 'seed-user-12', '6897a1cb-c6b8-5602-9912-9a86a05121b0', 5, '165Hz 화면이라 FPS 게임이 부드럽습니다. 키보드 조명이 예쁘고 타건감도 좋아요.', NULL, NULL, now() - interval '29 days'),
  ('355d84d0-d2a8-5f27-97a4-52626f06188e', 'seed-user-13', '6897a1cb-c6b8-5602-9912-9a86a05121b0', 3, '성능은 좋은데 게임 중에는 팬 소리가 꽤 큽니다. 헤드셋 쓰시는 분께 추천합니다.', NULL, NULL, now() - interval '31 days'),
  ('2f4f7e1b-7fdf-56e8-a823-bf5a5600e864', 'seed-user-15', 'e3f51223-acce-5666-8ffa-aa40cb148c4c', 5, '크기가 딱 좋고 카메라가 선명합니다. 배터리는 하루 반 정도 갑니다.', NULL, NULL, now() - interval '35 days'),
  ('f9be9bcf-03c6-5182-b0d2-23d6ced811be', 'seed-user-16', 'e3f51223-acce-5666-8ffa-aa40cb148c4c', 4, '화면과 속도는 만족합니다. 충전기가 구성품에 없어서 따로 샀습니다.', '환경 보호를 위해 충전기는 포함하지 않습니다. 20W 이상 PD 충전기를 권장드립니다.', now() - interval '4 days', now() - interval '37 days'),
  ('d4b7e47b-113d-5152-bd4b-3cf57c007716', 'seed-user-18', 'e9729f0c-089c-5dcd-9d8c-aad6d2763def', 5, '필기감이 종이에 가깝고 120Hz 화면이 부드럽습니다. 강의 필기용으로 잘 쓰고 있어요.', NULL, NULL, now() - interval '41 days'),
  ('358d503b-039e-528d-8d45-8334dca7ef25', 'seed-user-19', 'e9729f0c-089c-5dcd-9d8c-aad6d2763def', 4, '화면과 스피커가 좋습니다. 스타일러스가 별도라 그 점은 아쉽습니다.', NULL, NULL, now() - interval '43 days'),
  ('89af3b15-7b86-5472-8d5c-6faa3faedfb9', 'seed-user-21', 'f00d56c4-2728-5134-b94e-88e00e51af57', 5, '지하철에서 소음이 확실히 줄어듭니다. 착용감도 편해서 오래 껴도 아프지 않아요.', NULL, NULL, now() - interval '47 days'),
  ('8924339e-b866-52c0-aeca-a29241542c11', 'seed-user-22', 'f00d56c4-2728-5134-b94e-88e00e51af57', 4, '통화 품질은 괜찮은데 바람 부는 날은 소음이 조금 들어갑니다.', NULL, NULL, now() - interval '49 days'),
  ('fa25f8dc-dcd9-5b9b-ab0c-e3df1e906e6f', 'seed-user-24', 'fe930caa-ec54-5ca2-93ac-a76e06e8a969', 5, '저음이 묵직하고 이어패드가 푹신합니다. 배터리가 오래 가서 충전을 자주 하지 않아도 돼요.', NULL, NULL, now() - interval '53 days'),
  ('010107cd-0f53-50d5-9fc5-adae5965c2da', 'seed-user-25', 'fe930caa-ec54-5ca2-93ac-a76e06e8a969', 4, '소리는 만족합니다. 안경을 쓰면 오래 착용할 때 조금 눌립니다.', NULL, NULL, now() - interval '55 days'),
  ('a9f25304-5465-57ae-a710-4620f9dc6d96', 'seed-user-27', '2fc26e25-0d78-5772-9afa-2071e301f04a', 5, '디자인이 예쁘고 보컬 소리가 깨끗합니다. 책상에 두기만 해도 인테리어가 됩니다.', NULL, NULL, now() - interval '59 days'),
  ('6c287309-4c00-5389-87a5-f89a2852421b', 'seed-user-28', '2fc26e25-0d78-5772-9afa-2071e301f04a', 4, '소리는 좋은데 온이어라서 오래 쓰면 귀가 조금 아픕니다.', NULL, NULL, now() - interval '61 days'),
  ('47eeb65a-c133-583e-b154-e2dbdf8f6eb3', 'seed-user-30', '22a5719b-8140-54a7-a041-65ceb7c6bb00', 5, '가볍고 반응이 빠릅니다. 손목이 덜 피곤해요.', NULL, NULL, now() - interval '65 days'),
  ('a4bb43e2-76c9-5eaf-8b45-d4081466c861', 'seed-user-31', '22a5719b-8140-54a7-a041-65ceb7c6bb00', 4, '무선인데 지연이 느껴지지 않습니다. 사이드 버튼이 조금 작은 편입니다.', NULL, NULL, now() - interval '67 days'),
  ('ae805b02-a120-5998-a43e-b4c5a0748f2d', 'seed-user-33', '860a3998-bd7c-51d4-97f9-3aed7915a18b', 5, '키보드 소리가 거의 안 나서 밤에 써도 눈치 보이지 않아요. 기기 전환도 편합니다.', NULL, NULL, now() - interval '71 days'),
  ('059f27f4-fd54-5f6f-b28e-f28d9b1038a6', 'seed-user-34', '860a3998-bd7c-51d4-97f9-3aed7915a18b', 4, '타건감이 얕은 편이라 적응이 필요했습니다. 얇아서 휴대하기는 좋습니다.', NULL, NULL, now() - interval '73 days'),
  ('c8577419-6945-5b44-943a-759d6d07cbe7', 'seed-user-36', '9e30e598-374b-5b8b-a952-a29dc8bad92f', 5, '넉넉한 핏이고 안감이 따뜻합니다. 세탁 후에도 늘어나지 않았어요.', NULL, NULL, now() - interval '77 days'),
  ('320f403d-4379-5222-a92e-1f9aaac5df7f', 'seed-user-37', '9e30e598-374b-5b8b-a952-a29dc8bad92f', 4, '색이 사진과 같고 만족합니다. 오버핏이라 한 사이즈 작게 사도 괜찮을 것 같아요.', NULL, NULL, now() - interval '79 days'),
  ('3bf97437-dbb8-5ba3-8490-6b5bca0174f8', 'seed-user-39', '3fc08544-f0fc-5a8e-b383-f016f624a8b6', 5, '프린트가 선명하고 면이 부드럽습니다. 여러 번 빨아도 괜찮아요.', NULL, NULL, now() - interval '83 days'),
  ('f27322ae-3873-53cc-8e19-dba12e01d29c', 'seed-user-40', '3fc08544-f0fc-5a8e-b383-f016f624a8b6', 3, '디자인은 마음에 드는데 사이즈가 약간 작게 나온 것 같습니다.', '사이즈 안내에 정사이즈로 표기했지만 체형에 따라 작게 느끼실 수 있습니다. 교환은 가능합니다.', now() - interval '4 days', now() - interval '85 days'),
  ('b62cf53a-f89e-5686-a09a-c12b7de2c221', 'seed-user-42', '1557db50-5f29-558c-b008-cdbaf9adc9da', 5, '색감이 실제로 보면 더 고급스럽습니다. 앉았을 때 푹신하면서도 허리가 받쳐져요.', NULL, NULL, now() - interval '89 days'),
  ('99002ee1-0610-54fb-8186-fe4f012255b8', 'seed-user-43', '1557db50-5f29-558c-b008-cdbaf9adc9da', 4, '조립은 다리만 끼우면 되어 쉬웠습니다. 벨벳이라 먼지가 보이는 점은 있습니다.', '벨벳 소재는 부드러운 솔로 자주 털어 주시면 관리가 편합니다.', now() - interval '4 days', now() - interval '91 days'),
  ('43d99a0b-d279-55d5-9d06-74efc3b64593', 'seed-user-45', '34d61a83-9231-5cb7-9c27-0a50c662f49d', 5, '헤드 각도를 조절할 수 있어서 책 읽을 때 좋습니다. 디자인이 깔끔해요.', NULL, NULL, now() - interval '95 days'),
  ('fde3d08a-fe8c-51d9-be9f-bd949caba15a', 'seed-user-46', '34d61a83-9231-5cb7-9c27-0a50c662f49d', 4, '조립이 쉽습니다. 전구가 포함이라 따로 살 필요가 없었어요.', NULL, NULL, now() - interval '97 days'),
  ('eb8274c3-555d-539b-bac9-748f6dbacf63', 'seed-user-48', 'd7d92770-1d14-541a-9b43-0866e1aebb6b', 5, '촉감이 부드럽고 통기성이 좋습니다. 세탁 후 구김도 자연스럽게 예뻐요.', NULL, NULL, now() - interval '101 days'),
  ('56b9d2ad-c967-5f42-96f7-f981634bbe66', 'seed-user-49', 'd7d92770-1d14-541a-9b43-0866e1aebb6b', 4, '이불솜은 별도라서 사이즈를 잘 맞춰 사세요. 커버만 보면 만족합니다.', NULL, NULL, now() - interval '103 days')
ON CONFLICT (id) DO UPDATE SET rating = EXCLUDED.rating, content = EXCLUDED.content, admin_reply = EXCLUDED.admin_reply;

INSERT INTO public.product_qnas (id, user_id, product_id, title, content, answer, is_answered, created_at) VALUES
  ('fb11f9d5-1100-5e10-ae0f-00a01ac09f97', 'seed-user-3', '326d449b-86de-5c16-bdab-2669c74dff03', '충전기 구성이 어떻게 되나요?', 'USB-C 충전기가 기본 포함인지 궁금합니다.', '65W USB-C 어댑터가 기본 포함입니다. 보조배터리 충전도 PD 지원 제품이면 가능합니다.', true, now() - interval '5 days'),
  ('d7a1c764-279b-57b4-9ec5-712f88ce15ef', 'seed-user-4', '326d449b-86de-5c16-bdab-2669c74dff03', '저장 공간을 나중에 늘릴 수 있나요?', 'SSD 교체가 가능한지 알고 싶어요.', NULL, false, now() - interval '6 days'),
  ('c5057411-37e3-5620-81bd-56bd11b9ed21', 'seed-user-7', '10a7cbcd-fb3f-58cd-b4d3-f58a3f1eac49', '펜은 포함인가요?', '터치 입력이 된다고 해서 펜도 같이 오는지 궁금합니다.', '펜은 별도 구매입니다. 일반 터치 입력은 기본으로 사용할 수 있습니다.', true, now() - interval '9 days'),
  ('6f146e28-ae26-5837-a77e-2ab0ac8c12e5', 'seed-user-10', '3a717dfa-3a60-537d-8369-42ba8bee48c3', '색 보정 프로파일이 들어 있나요?', '영상 작업용인데 출고 시 색 보정이 되어 있는지 궁금합니다.', '출고 시 sRGB·DCI-P3 프로파일이 들어 있습니다. 정밀 작업은 별도 캘리브레이션을 권장합니다.', true, now() - interval '12 days'),
  ('aecc55fa-6d1d-5ba1-8275-3437f35d5547', 'seed-user-11', '3a717dfa-3a60-537d-8369-42ba8bee48c3', 'SSD를 추가로 달 수 있나요?', '슬롯이 남는지 궁금해요.', NULL, false, now() - interval '13 days'),
  ('94845021-f0a8-5fe4-889f-44443d024570', 'seed-user-14', '6897a1cb-c6b8-5602-9912-9a86a05121b0', '게임하면서 충전하면 배터리가 줄지는 않나요?', '어댑터를 꽂은 채로 게임할 수 있는지 궁금해요.', '어댑터를 연결한 상태에서 정상적으로 사용할 수 있습니다. 배터리 수명이 걱정되시면 제어 프로그램의 충전 제한 기능을 사용하세요.', true, now() - interval '16 days'),
  ('13dceec5-6834-5ac2-8d36-407f18c2a399', 'seed-user-17', 'e3f51223-acce-5666-8ffa-aa40cb148c4c', '방수 등급이 어떻게 되나요?', '욕실 근처에서 써도 괜찮을까요?', 'IP68 등급입니다. 생활 방수에는 충분하지만 일부러 물에 담그는 사용은 권장하지 않습니다.', true, now() - interval '19 days'),
  ('51b5e12a-993e-5d61-8bc2-9fe728e4996e', 'seed-user-20', 'e9729f0c-089c-5dcd-9d8c-aad6d2763def', '스타일러스는 어디서 사나요?', '같이 구매할 수 있는지 궁금합니다.', '스타일러스는 별도 판매 상품입니다. 상세 페이지의 호환 목록에서 확인하실 수 있습니다.', true, now() - interval '22 days'),
  ('c52ac8d4-426b-55d3-a622-35677aa92009', 'seed-user-23', 'f00d56c4-2728-5134-b94e-88e00e51af57', '안드로이드 폰에서도 쓸 수 있나요?', '블루투스 연결이면 모두 되는지 궁금해요.', '블루투스 5.3을 지원해 안드로이드와 iOS 모두 연결할 수 있습니다.', true, now() - interval '25 days'),
  ('6b85f3b8-27af-55d1-a86d-f6a4d66b9b9c', 'seed-user-26', 'fe930caa-ec54-5ca2-93ac-a76e06e8a969', '유선으로도 쓸 수 있나요?', '배터리가 없을 때 케이블 연결이 되는지 궁금합니다.', '3.5mm 케이블이 포함되어 있어 유선 연결도 가능합니다.', true, now() - interval '28 days'),
  ('59831c1a-8bab-5412-96e7-03c579cc8a60', 'seed-user-29', '2fc26e25-0d78-5772-9afa-2071e301f04a', '케이블 길이는 얼마인가요?', '1.2m인지 1.5m인지 궁금합니다.', '기본 케이블은 1.2m입니다.', true, now() - interval '31 days'),
  ('0924331d-2528-511a-9960-86353c0f508e', 'seed-user-32', '22a5719b-8140-54a7-a041-65ceb7c6bb00', '블루투스도 지원하나요?', '2.4GHz 수신기 말고 블루투스 연결도 되는지요.', '2.4GHz 수신기와 유선(USB-C) 연결을 지원합니다. 블루투스는 지원하지 않습니다.', true, now() - interval '34 days'),
  ('0fdeece3-d438-5479-94ec-aafb05db6b90', 'seed-user-35', '860a3998-bd7c-51d4-97f9-3aed7915a18b', '맥에서도 쓸 수 있나요?', '맥북에서 쓰려는데 키 배열이 맞는지 궁금합니다.', '맥 모드 전환을 지원합니다. 키보드 오른쪽 위의 전환 키로 바꿀 수 있습니다.', true, now() - interval '37 days'),
  ('65cdea9e-2d92-517d-aa40-fec7ff94bfee', 'seed-user-38', '9e30e598-374b-5b8b-a952-a29dc8bad92f', '키 175cm에 L이 맞나요?', '체중은 70kg 정도입니다.', '175cm, 70kg이시면 L은 여유 있는 오버핏, M은 단정한 핏입니다. 편하게 입으시려면 L을 권장합니다.', true, now() - interval '40 days'),
  ('c5ef6e61-9e7c-5ca0-84a2-7301615b75e7', 'seed-user-41', '3fc08544-f0fc-5a8e-b383-f016f624a8b6', '세탁은 어떻게 하나요?', '뒤집어서 세탁기를 돌려도 되는지 궁금합니다.', '뒤집어서 30도 이하 찬물로 세탁하시고 건조기는 사용하지 마세요.', true, now() - interval '43 days'),
  ('2bc4c232-0e8f-56f2-9c26-27822a98640d', 'seed-user-44', '1557db50-5f29-558c-b008-cdbaf9adc9da', '배송 시 설치도 해주나요?', '다리 조립이 필요한지 알고 싶습니다.', '다리만 끼우는 간단한 조립이며 설치 서비스는 따로 제공하지 않습니다. 박스에 도구가 들어 있습니다.', true, now() - interval '46 days'),
  ('d25e83b0-b0fc-5c9d-878b-c43691bc1584', 'seed-user-47', '34d61a83-9231-5cb7-9c27-0a50c662f49d', '전구 소켓 규격이 어떻게 되나요?', '나중에 다른 전구로 바꾸려고 합니다.', 'E26 소켓입니다. 시중의 일반 LED 전구를 사용할 수 있습니다.', true, now() - interval '49 days'),
  ('fb43484c-6c33-5be5-a396-0fe174eb5a99', 'seed-user-50', 'd7d92770-1d14-541a-9b43-0866e1aebb6b', '이불솜도 포함인가요?', '커버만 오는지 궁금합니다.', '이불 커버와 베개 커버 구성이며 이불솜은 포함되지 않습니다.', true, now() - interval '52 days')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, answer = EXCLUDED.answer, is_answered = EXCLUDED.is_answered;

COMMIT;
