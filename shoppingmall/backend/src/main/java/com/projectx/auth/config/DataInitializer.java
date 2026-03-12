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
 * 어플리케이션 구동 시 초기 테스트 데이터를 생성합니다.
 * [보안] 모든 카테고리에 상품을 채우고, 테스트 편의를 위해 기존 데이터를 초기화합니다.
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
        // 테스트 편의를 위해 기존 데이터 완전 초기화 (필요 시 주석 처리)
        userProfileRepository.deleteAll();
        userRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();

        // 1. 상위 카테고리 생성
        Category digital = categoryRepository.save(new Category("디지털/가전", null, 1));
        Category fashion = categoryRepository.save(new Category("패션의류", null, 2));
        Category living = categoryRepository.save(new Category("리빙/인테리어", null, 3));

        // 디지털 하위
        Category mobile = categoryRepository.save(new Category("모바일", digital, 1));
        Category audio = categoryRepository.save(new Category("음향기기", digital, 2));
        Category pc = categoryRepository.save(new Category("PC주변기기", digital, 3));
        Category appliances = categoryRepository.save(new Category("가전제품", digital, 4));

        // 패션 하위
        Category unisex = categoryRepository.save(new Category("남성유니섹스", fashion, 1));
        Category women = categoryRepository.save(new Category("여성의류", fashion, 2));
        Category shoes = categoryRepository.save(new Category("신발", fashion, 3));

        // 리빙 하위
        Category furniture = categoryRepository.save(new Category("가구", living, 1));
        Category lighting = categoryRepository.save(new Category("조명", living, 2));
        Category kitchen = categoryRepository.save(new Category("주방용품", living, 3));

        // 2. 상품 데이터 생성 (모든 카테고리 채우기)
        
        // 모바일
        saveProduct("최신형 스마트폰 X1", "초고성능 카메라와 5000mAh 대용량 배터리", "1200000", 100, "phone", mobile);
        saveProduct("태블릿 프로 12.9", "전문가용 고해상도 디스플레이 태블릿", "990000", 50, "tablet", mobile);

        // 음향기기
        saveProduct("노이즈 캔슬링 헤드폰", "주변 소음을 99% 차단하는 프리미엄 사운드", "350000", 50, "audio", audio);
        saveProduct("무선 이어폰 에어핏", "커널형 디자인의 고음질 블루투스 이어폰", "180000", 200, "earbuds", audio);

        // PC주변기기
        saveProduct("기계식 키보드 (청축)", "경쾌한 타건감의 게이밍 최적화 키보드", "150000", 30, "keyboard", pc);
        saveProduct("고해상도 4K 모니터", "전문가용 32인치 울트라 HD 모니터", "600000", 20, "monitor", pc);

        // 가전제품
        saveProduct("스마트 로봇 청소기", "자동 충전 및 인공지능 맵핑 지원", "450000", 15, "robot", appliances);
        saveProduct("공기청정기 에어퓨어", "H13 헤파필터 탑재 고성능 공기청정기", "290000", 40, "air", appliances);

        // 남성유니섹스
        saveProduct("오버핏 코튼 후드티", "사계절 내내 착용 가능한 탄탄한 조직감", "59000", 200, "hoodie", unisex);
        saveProduct("와이드 슬랙스 팬츠", "세련된 핏과 편안한 착용감의 데일리 슬랙스", "45000", 150, "pants", unisex);

        // 여성의류
        saveProduct("캐시미어 브이넥 니트", "부드러운 촉감의 100% 캐시미어 혼방 니트", "89000", 80, "knit", women);
        saveProduct("플리츠 롱 스커트", "우아한 실루엣과 고급스러운 광택의 스커트", "55000", 60, "skirt", women);

        // 신발
        saveProduct("데일리 화이트 스니커즈", "깔끔한 디자인의 천연 가죽 스니커즈", "89000", 150, "shoes", shoes);
        saveProduct("러닝 포커스 운동화", "충격 흡수가 뛰어난 고기능성 러닝화", "129000", 100, "running", shoes);

        // 가구
        saveProduct("노르딕 패브릭 소파", "편안한 쿠션감의 북유럽풍 3인용 소파", "450000", 10, "sofa", furniture);
        saveProduct("원목 거실 테이블", "따뜻한 질감의 고급 오크 원목 테이블", "120000", 25, "table", furniture);

        // 조명
        saveProduct("심플 데스크 LED 스탠드", "3단계 밝기 조절 및 시력 보호 기능", "32000", 80, "lamp", lighting);
        saveProduct("무드 무선 무드등", "앱 제어가 가능한 1600만 색상 무드등", "25000", 120, "mood", lighting);

        // 주방용품
        saveProduct("세라믹 냄비 3종 세트", "유해물질 없는 친환경 세라믹 코팅", "150000", 40, "pot", kitchen);
        saveProduct("스테인리스 칼블럭 세트", "주방의 품격을 높이는 일체형 칼 세트", "85000", 30, "knife", kitchen);
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
