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
 * 어플리케이션 구동 시 DB를 초기화하고 가장 매칭률이 높은 상품 이미지를 적재합니다.
 * [중요] Redis 캐시를 함께 초기화하여 이전 데이터가 노출되는 현상을 방지합니다.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final CacheManager cacheManager; // 캐시 비우기용

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Redis 캐시 강제 초기화
        Objects.requireNonNull(cacheManager.getCache("products")).clear();

        // 2. DB 완전 초기화
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

        // 4. 상품 데이터 생성 (정밀하게 매칭된 Unsplash 고유 ID 사용)
        
        // 디지털
        saveProduct("최신형 스마트폰 X1", "최신형 디자인과 성능", "1200000", 100, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800", mobile);
        saveProduct("태블릿 프로 12.9", "전문가용 태블릿", "990000", 50, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800", mobile);
        saveProduct("노이즈 캔슬링 헤드폰", "고품격 사운드", "350000", 50, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", audio);
        saveProduct("기계식 키보드 (청축)", "게이밍 최적화", "150000", 30, "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800", pc);
        saveProduct("공기청정기 에어퓨어", "쾌적한 실내 환경", "290000", 40, "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800", appliances);

        // 패션
        saveProduct("오버핏 코튼 후드티", "데일리 코디 아이템", "59000", 200, "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800", unisex);
        saveProduct("와이드 슬랙스 팬츠", "편안한 착용감", "45000", 150, "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800", unisex);
        saveProduct("캐시미어 브이넥 니트", "최고급 캐시미어 100%", "89000", 80, "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800", women);
        saveProduct("플리츠 롱 스커트", "우아한 실루엣", "55000", 60, "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800", women);
        saveProduct("데일리 화이트 스니커즈", "깔끔한 화이트 감성", "89000", 150, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", shoes);

        // 리빙
        saveProduct("노르딕 패브릭 소파", "북유럽 미니멀 소파", "450000", 10, "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800", furniture);
        saveProduct("원목 거실 테이블", "따뜻한 원목 가구", "120000", 25, "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800", furniture);
        saveProduct("심플 데스크 LED 스탠드", "눈이 편안한 조명", "32000", 80, "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800", lighting);
        saveProduct("세라믹 냄비 3종 세트", "주방의 감성을 더하는 쿡웨어", "150000", 40, "https://images.unsplash.com/photo-1584990344619-391fa0c4d236?w=800", kitchen);
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
