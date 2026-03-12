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
 * 어플리케이션 구동 시 상품명과 정확히 일치하는 고화질 이미지를 포함한 데이터를 생성합니다.
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
        // 데이터 강제 초기화
        userProfileRepository.deleteAll();
        userRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        // 1. 카테고리 생성
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

        // 2. 상품 데이터 생성 (고퀄리티 키워드 기반 이미지 매칭)
        
        // 디지털
        saveProduct("최신형 스마트폰 X1", "초고성능 카메라와 5000mAh 대용량 배터리", "1200000", 100, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop", mobile);
        saveProduct("태블릿 프로 12.9", "전문가용 고해상도 디스플레이 태블릿", "990000", 50, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop", mobile);
        saveProduct("노이즈 캔슬링 헤드폰", "주변 소음을 99% 차단하는 프리미엄 사운드", "350000", 50, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop", audio);
        saveProduct("기계식 키보드 (청축)", "경쾌한 타건감의 게이밍 최적화 키보드", "150000", 30, "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=800&auto=format&fit=crop", pc);
        saveProduct("고해상도 4K 모니터", "전문가용 32인치 울트라 HD 모니터", "600000", 20, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop", pc);
        saveProduct("공기청정기 에어퓨어", "H13 헤파필터 탑재 고성능 공기청정기", "290000", 40, "https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=800&auto=format&fit=crop", appliances);

        // 패션
        saveProduct("오버핏 코튼 후드티", "사계절 내내 착용 가능한 탄탄한 조직감", "59000", 200, "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop", unisex);
        saveProduct("캐시미어 브이넥 니트", "부드러운 촉감의 100% 캐시미어 니트", "89000", 80, "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop", women);
        saveProduct("데일리 화이트 스니커즈", "깔끔한 디자인의 천연 가죽 스니커즈", "89000", 150, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop", shoes);
        saveProduct("플리츠 롱 스커트", "우아한 실루엣의 고급스러운 스커트", "55000", 60, "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop", women);

        // 리빙
        saveProduct("노르딕 패브릭 소파", "편안한 쿠션감의 북유럽풍 3인용 소파", "450000", 10, "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop", furniture);
        saveProduct("원목 거실 테이블", "따뜻한 질감의 고급 오크 원목 테이블", "120000", 25, "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop", furniture);
        saveProduct("심플 데스크 LED 스탠드", "3단계 밝기 조절 및 시력 보호 기능", "32000", 80, "https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=800&auto=format&fit=crop", lighting);
        saveProduct("세라믹 냄비 3종 세트", "유해물질 없는 친환경 세라믹 코팅", "150000", 40, "https://images.unsplash.com/photo-1584990344619-391fa0c4d236?q=80&w=800&auto=format&fit=crop", kitchen);
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
