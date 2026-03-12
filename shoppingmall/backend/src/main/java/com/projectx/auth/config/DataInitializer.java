package com.projectx.auth.config;

import com.projectx.auth.domain.entity.Category;
import com.projectx.auth.domain.entity.Product;
import com.projectx.auth.domain.repository.CategoryRepository;
import com.projectx.auth.domain.repository.ProductRepository;
import com.projectx.auth.domain.repository.UserRepository;
import com.projectx.auth.domain.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * 어플리케이션 구동 시 DB를 초기화하고 Picsum 기반의 최적화된 이미지를 적재합니다.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final CacheManager cacheManager;

    @Override
    @Transactional
    public void run(String... args) {
        // 1. 캐시 비우기
        if (cacheManager.getCache("products") != null) {
            cacheManager.getCache("products").clear();
        }

        // 2. DB 초기화
        userProfileRepository.deleteAll();
        userRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        // 3. 카테고리 생성
        Category digital = categoryRepository.save(new Category("디지털/가전", null, 1));
        Category fashion = categoryRepository.save(new Category("패션의류", null, 2));
        Category living = categoryRepository.save(new Category("리빙/인테리어", null, 3));

        Category mobile = categoryRepository.save(new Category("모바일", digital, 1));
        Category audio = categoryRepository.save(new Category("음향기기", digital, 2));
        Category pc = categoryRepository.save(new Category("PC주변기기", digital, 3));
        Category appliances = categoryRepository.save(new Category("가전제품", digital, 4));

        Category unisex = categoryRepository.save(new Category("남성유니섹스", fashion, 1));
        Category women = categoryRepository.save(new Category("여성의류", fashion, 2));
        Category shoes = categoryRepository.save(new Category("신발", fashion, 3));

        Category furniture = categoryRepository.save(new Category("가구", living, 1));
        Category lighting = categoryRepository.save(new Category("조명", living, 2));
        Category kitchen = categoryRepository.save(new Category("주방용품", living, 3));

        // 4. 상품 데이터 생성 (Picsum Seed 최적화)
        
        // 디지털
        saveProduct("최신형 스마트폰 X1", "초고성능 카메라 탑재", "1200000", 100, "phone", mobile);
        saveProduct("태블릿 프로 12.9", "전문가용 태블릿", "990000", 50, "tablet", mobile);
        saveProduct("노이즈 캔슬링 헤드폰", "프리미엄 사운드", "350000", 50, "headphone", audio);
        saveProduct("기계식 키보드 (청축)", "게이밍 최적화", "150000", 30, "keyboard", pc);
        saveProduct("고해상도 4K 모니터", "32인치 울트라 HD", "600000", 20, "monitor", pc);
        saveProduct("공기청정기 에어퓨어", "H13 헤파필터 탑재", "290000", 40, "tech", appliances);

        // 패션
        saveProduct("오버핏 코튼 후드티", "탄탄한 조직감", "59000", 200, "clothing", unisex);
        saveProduct("와이드 슬랙스 팬츠", "세련된 핏", "45000", 150, "fashion", unisex);
        saveProduct("캐시미어 브이넥 니트", "부드러운 프리미엄 니트", "89000", 80, "sweater", women);
        saveProduct("플리츠 롱 스커트", "우아한 실루엣의 스커트", "55000", 60, "skirt", women);
        saveProduct("데일리 화이트 스니커즈", "천연 가죽 스니커즈", "89000", 150, "sneaker", shoes);

        // 리빙
        saveProduct("노르딕 패브릭 소파", "미니멀한 3인용 소파", "450000", 10, "sofa", furniture);
        saveProduct("원목 거실 테이블", "따뜻한 오크 원목", "120000", 25, "table", furniture);
        saveProduct("심플 데스크 LED 스탠드", "눈 보호 스탠드", "32000", 80, "lamp", lighting);
        saveProduct("세라믹 냄비 3종 세트", "친환경 세라믹 코팅", "150000", 40, "kitchen", kitchen);
    }

    private void saveProduct(String name, String desc, String price, int stock, String seed, Category cat) {
        productRepository.save(Product.builder()
                .name(name)
                .description(desc)
                .price(new BigDecimal(price))
                .stockQuantity(stock)
                .mainImageUrl("https://picsum.photos/seed/" + seed + "/800/800")
                .category(cat)
                .build());
    }
}
