package com.projectx.auth.config;

import com.projectx.auth.domain.entity.Category;
import com.projectx.auth.domain.entity.Product;
import com.projectx.auth.domain.repository.CategoryRepository;
import com.projectx.auth.domain.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * 어플리케이션 구동 시 초기 테스트 데이터를 생성합니다.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            Category digital = categoryRepository.save(new Category("디지털/가전", null, 1));
            Category fashion = categoryRepository.save(new Category("패션의류", null, 2));
            Category living = categoryRepository.save(new Category("리빙/인테리어", null, 3));

            // 디지털 하위
            Category mobile = categoryRepository.save(new Category("모바일", digital, 1));
            Category audio = categoryRepository.save(new Category("음향기기", digital, 2));
            Category pc = categoryRepository.save(new Category("PC주변기기", digital, 3));
            Category appliances = categoryRepository.save(new Category("가전제품", digital, 4));
            Category camera = categoryRepository.save(new Category("카메라", digital, 5));

            // 패션 하위
            Category unisex = categoryRepository.save(new Category("남성유니섹스", fashion, 1));
            Category women = categoryRepository.save(new Category("여성의류", fashion, 2));
            Category shoes = categoryRepository.save(new Category("신발", fashion, 3));
            categoryRepository.save(new Category("가방/잡화", fashion, 4));
            categoryRepository.save(new Category("쥬얼리", fashion, 5));

            // 리빙 하위
            Category furniture = categoryRepository.save(new Category("가구", living, 1));
            categoryRepository.save(new Category("침구", living, 2));
            Category lighting = categoryRepository.save(new Category("조명", living, 3));
            categoryRepository.save(new Category("인테리어소품", living, 4));
            categoryRepository.save(new Category("주방용품", living, 5));

            if (productRepository.count() <= 5) {
                // 기존 상품 삭제 후 재등록 (카테고리 매핑 최적화)
                productRepository.deleteAll();

                productRepository.save(Product.builder()
                        .name("최신형 스마트폰 X1")
                        .description("초고성능 카메라와 5000mAh 대용량 배터리를 탑재한 차세대 스마트폰입니다.")
                        .price(new BigDecimal("1200000"))
                        .stockQuantity(100)
                        .mainImageUrl("https://picsum.photos/seed/phone/800/800")
.category(mobile)
.build());

productRepository.save(Product.builder()
.name("노이즈 캔슬링 헤드폰")
.description("주변 소음을 99% 차단하여 완벽한 음악 감상 환경을 제공하는 프리미엄 헤드폰입니다.")
.price(new BigDecimal("350000"))
.stockQuantity(50)
.mainImageUrl("https://picsum.photos/seed/audio/800/800")
.category(audio)
.build());

productRepository.save(Product.builder()
.name("기계식 키보드 (청축)")
.description("경쾌한 타건감과 RGB 백라이트를 지원하는 게이밍 최적화 키보드입니다.")
.price(new BigDecimal("150000"))
.stockQuantity(30)
.mainImageUrl("https://picsum.photos/seed/keyboard/800/800")
.category(pc)
.build());

productRepository.save(Product.builder()
.name("고해상도 4K 모니터")
.description("전문가용 색영역을 지원하는 32인치 울트라 HD 모니터입니다.")
.price(new BigDecimal("600000"))
.stockQuantity(20)
.mainImageUrl("https://picsum.photos/seed/monitor/800/800")
.category(pc)
.build());

productRepository.save(Product.builder()
.name("오버핏 코튼 후드티")
.description("사계절 내내 착용 가능한 탄탄한 조직감의 오버핏 후드티입니다.")
.price(new BigDecimal("59000"))
.stockQuantity(200)
.mainImageUrl("https://picsum.photos/seed/hoodie/800/800")
.category(unisex)
.build());

productRepository.save(Product.builder()
.name("데일리 화이트 스니커즈")
.description("어떤 코디에도 잘 어울리는 깔끔한 디자인의 가죽 스니커즈입니다.")
.price(new BigDecimal("89000"))
.stockQuantity(150)
.mainImageUrl("https://picsum.photos/seed/shoes/800/800")
.category(shoes)
.build());

productRepository.save(Product.builder()
.name("노르딕 패브릭 소파")
.description("편안한 쿠션감과 미니멀한 디자인이 돋보이는 3인용 소파입니다.")
.price(new BigDecimal("450000"))
.stockQuantity(10)
.mainImageUrl("https://picsum.photos/seed/sofa/800/800")
.category(furniture)
.build());

productRepository.save(Product.builder()
.name("심플 데스크 LED 스탠드")
.description("3단계 밝기 조절과 눈 보호 기능을 갖춘 모던한 디자인의 스탠드입니다.")
.price(new BigDecimal("32000"))
.stockQuantity(80)
.mainImageUrl("https://picsum.photos/seed/lamp/800/800")
                        .category(lighting)
                        .build());
            }
        }
    }
}
