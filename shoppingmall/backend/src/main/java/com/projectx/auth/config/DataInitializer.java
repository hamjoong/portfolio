package com.projectx.auth.config;

import com.projectx.auth.domain.entity.Category;
import com.projectx.auth.domain.entity.Product;
import com.projectx.auth.domain.repository.CategoryRepository;
import com.projectx.auth.domain.repository.ProductRepository;
import com.projectx.auth.domain.repository.UserRepository;
import com.projectx.auth.domain.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * 어플리케이션 구동 시 검증된 상품 이미지를 포함한 데이터를 생성합니다.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional
    public void run(String... args) {
        userProfileRepository.deleteAll();
        userRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

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

        // [디지털]
        saveProduct("최신형 스마트폰 X1", "초고성능 카메라 탑재", "1200000", 100, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800", mobile);
        saveProduct("태블릿 프로 12.9", "전문가용 태블릿", "990000", 50, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800", mobile);
        saveProduct("노이즈 캔슬링 헤드폰", "프리미엄 사운드", "350000", 50, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800", audio);
        saveProduct("기계식 키보드 (청축)", "게이밍 최적화", "150000", 30, "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800", pc);
        saveProduct("고해상도 4K 모니터", "32인치 울트라 HD", "600000", 20, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800", pc);
        saveProduct("공기청정기 에어퓨어", "H13 헤파필터 탑재", "290000", 40, "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800", appliances);

        // [패션]
        saveProduct("오버핏 코튼 후드티", "탄탄한 조직감", "59000", 200, "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800", unisex);
        saveProduct("와이드 슬랙스 팬츠", "세련된 핏", "45000", 150, "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800", unisex);
        saveProduct("캐시미어 브이넥 니트", "부드러운 프리미엄 니트", "89000", 80, "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800", women);
        saveProduct("플리츠 롱 스커트", "우아한 실루엣", "55000", 60, "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800", women);
        saveProduct("데일리 화이트 스니커즈", "천연 가죽 스니커즈", "89000", 150, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800", shoes);

        // [리빙]
        saveProduct("노르딕 패브릭 소파", "북유럽풍 3인용 소파", "450000", 10, "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800", furniture);
        saveProduct("원목 거실 테이블", "오크 원목 테이블", "120000", 25, "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800", furniture);
        saveProduct("심플 데스크 LED 스탠드", "시력 보호 기능", "32000", 80, "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=800", lighting);
        saveProduct("세라믹 냄비 3종 세트", "친환경 세라믹 코팅", "150000", 40, "https://images.unsplash.com/photo-1584990344619-391fa0c4d236?auto=format&fit=crop&w=800", kitchen);
    }

    private void saveProduct(String name, String desc, String price, int stock, String imageUrl, Category cat) {
        productRepository.save(Product.builder()
                .name(name)
                .description(desc)
                .price(new BigDecimal(price))
                .stockQuantity(stock)
                .mainImageUrl(imageUrl)
                .category(cat)
                .build());
    }
}
