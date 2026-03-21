package com.projectx.auth.config;

import com.projectx.auth.domain.entity.Category;
import com.projectx.auth.domain.entity.Product;
import com.projectx.auth.domain.entity.ProductQna;
import com.projectx.auth.domain.entity.Review;
import com.projectx.auth.domain.entity.User;
import com.projectx.auth.domain.entity.UserProfile;
import com.projectx.auth.domain.entity.UserStatus;
import com.projectx.auth.domain.repository.CategoryRepository;
import com.projectx.auth.domain.repository.ProductRepository;
import com.projectx.auth.domain.repository.UserRepository;
import com.projectx.auth.domain.repository.UserProfileRepository;
import com.projectx.auth.domain.repository.ReviewRepository;
import com.projectx.auth.domain.repository.ProductQnaRepository;
import com.projectx.auth.domain.entity.Review;
import com.projectx.auth.service.KmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * 시스템 초기 가동 시 필수 데이터를 생성하고 관리자 계정을 동기화합니다.
 * [수정] 반복적인 로그인 실패를 해결하기 위해, 기존 어드민 계정을 삭제하고 새로 생성하는 방식으로 변경합니다.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final ReviewRepository reviewRepository;
    private final ProductQnaRepository productQnaRepository;
    private final PasswordEncoder passwordEncoder;
    private final KmsService kmsService;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("[Init] Starting data initialization and admin sync...");
        
        String adminEmail = "admin@projectx.com";
        String adminPassword = "admin123!@#";

        // [수정] 삭제 후 재생성은 외래 키 제약 조건 문제를 일으키므로, 존재 확인 후 업데이트 방식으로 변경합니다.
        Optional<User> adminOpt = userRepository.findByEmail(adminEmail.toLowerCase());
        User adminUser;
        if (adminOpt.isPresent()) {
            adminUser = adminOpt.get();
            log.info("[Init] Admin account already exists. Updating password and roles.");
            adminUser.setPassword(passwordEncoder.encode(adminPassword));
            adminUser.setRole("ROLE_ADMIN");
            adminUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(adminUser);
            
            // 프로필 존재 확인 및 업데이트
            userProfileRepository.findById(adminUser.getId()).ifPresentOrElse(
                profile -> {
                    log.debug("[Init] Admin profile exists. Syncing data.");
                    syncAdminProfile(adminUser.getId());
                },
                () -> {
                    log.info("[Init] Admin profile missing. Creating new profile.");
                    syncAdminProfile(adminUser.getId());
                }
            );
        } else {
            log.info("[Init] Admin account missing. Creating new admin: {}", adminEmail);
            User newAdmin = User.builder()
                    .email(adminEmail.toLowerCase())
                    .password(passwordEncoder.encode(adminPassword))
                    .role("ROLE_ADMIN")
                    .status(UserStatus.ACTIVE)
                    .build();
            adminUser = userRepository.save(newAdmin);
            syncAdminProfile(adminUser.getId());
        }

        log.info("[Init] Admin account sync completed for: {}", adminEmail);

        // 3. 계층적 카테고리 및 대량 샘플 상품 데이타 (Phase 15.1 리팩토링)
        log.info("[Init] Checking and creating sample data...");
        
        // 대분류 확보
        Category fashion = getOrCreateCategory("패션의류", null, 1);
        Category electronics = getOrCreateCategory("전자제품", null, 2);
        Category food = getOrCreateCategory("식품", null, 3);

        // 가전디지털이 따로 있다면 전자제품으로 통합 및 안전 삭제 (Phase 15.2 안정화)
        categoryRepository.findByName("가전디지털").ifPresent(legacy -> {
            log.info("[Init] Found redundant '가전디지털' category. Attempting safe migration to '전자제품'...");
            
            // 1. 가전디지털 하위의 모든 상품을 전자제품으로 이관
            productRepository.findByCategory(legacy).forEach(p -> {
                p.setCategory(electronics);
                productRepository.save(p);
            });
            
            // 2. 가전디지털 하위의 모든 자식 카테고리를 전자제품으로 이관
            categoryRepository.findByParent(legacy).forEach(c -> {
                c.setParent(electronics);
                categoryRepository.save(c);
            });
            
            // 3. 이제 자식과 상품이 없으므로 안전하게 삭제 가능
            categoryRepository.delete(legacy);
            log.info("[Init] Successfully migrated and removed '가전디지털' category.");
        });

        // 중분류 확보 (getOrCreateCategory 내에서 부모가 다를 경우 자동 업데이트)
        Category menFashion = getOrCreateCategory("남성패션", fashion, 1);
        Category womenFashion = getOrCreateCategory("여성패션", fashion, 2);
        Category computer = getOrCreateCategory("컴퓨터/노트북", electronics, 1);
        Category mobile = getOrCreateCategory("모바일/태블릿", electronics, 2);
        Category freshFood = getOrCreateCategory("신선식품", food, 1);

        // 상품 등록 (존재하지 않는 것만 등록)
        saveProductIfNotExist("MacBook Pro 16", "M3 Max 전문가용", "4500000", 10, computer, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8");
        saveProductIfNotExist("LG gram 17", "초경량 대화면 노트북", "2100000", 15, computer, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed");
        saveProductIfNotExist("iPhone 15 Pro", "티타늄 바디 최신 모델", "1550000", 20, mobile, "https://images.unsplash.com/photo-1696446701796-da61225697cc");
        saveProductIfNotExist("Galaxy S24 Ultra", "AI 기능 탑재 플래그십", "1690000", 25, mobile, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf");
        saveProductIfNotExist("프리미엄 옥스퍼드 셔츠", "클래식한 핏의 화이트 셔츠", "49000", 100, menFashion, "https://images.unsplash.com/photo-1596755094514-f87e34085b2c");
        saveProductIfNotExist("슬림핏 셀비지 데님", "자연스러운 워싱의 청바지", "79000", 50, menFashion, "https://images.unsplash.com/photo-1542272604-787c3835535d");
        saveProductIfNotExist("캐시미어 롱 코트", "겨울철 우아한 실루엣", "299000", 30, womenFashion, "https://images.unsplash.com/photo-1539533018447-63fcce2678e3");
        saveProductIfNotExist("플로럴 쉬폰 원피스", "화사한 봄날의 외출복", "89000", 40, womenFashion, "https://loremflickr.com/800/800/floral,dress");
        saveProductIfNotExist("제주 유기농 감귤 5kg", "산지직송 당도 보장", "25000", 200, freshFood, "https://images.unsplash.com/photo-1557800636-894a64c1696f");
        saveProductIfNotExist("프리미엄 1등급 한우 세트", "명절 선물용 최고급 육질", "185000", 20, freshFood, "https://images.unsplash.com/photo-1588168333986-5078d3ae3976");

        // [추가] 샘플 리뷰 및 Q&A 데이타 생성
        seedReviewsAndQnas(adminUser.getId());

        log.info("[Init] Sample data sync and cleanup completed.");
    }

    private void seedReviewsAndQnas(UUID userId) {
        log.info("[Init] Seeding reviews and QNAs...");
        productRepository.findAll().forEach(product -> {
            // 리뷰 생성 (상품당 2개)
            if (reviewRepository.findByProductId(product.getId(), PageRequest.of(0, 1)).isEmpty()) {
                Review r1 = Review.builder()
                        .userId(userId)
                        .productId(product.getId())
                        .orderId(UUID.randomUUID())
                        .rating(5)
                        .content("상품이 정말 마음에 듭니다! 배송도 빨라요. " + product.getName() + " 최고입니다.")
                        .build();
                Review r2 = Review.builder()
                        .userId(userId)
                        .productId(product.getId())
                        .orderId(UUID.randomUUID())
                        .rating(4)
                        .content("생상보다 훨씬 퀄리티가 좋네요. 가성비 갑입니다.")
                        .build();
                reviewRepository.save(r1);
                reviewRepository.save(r2);
            }

            // Q&A 생성 (상품당 2개, 하나는 답변 완료)
            if (productQnaRepository.findByProductId(product.getId(), PageRequest.of(0, 1)).isEmpty()) {
                ProductQna q1 = ProductQna.builder()
                        .userId(userId)
                        .productId(product.getId())
                        .title("배송 문의")
                        .content("오늘 주문하면 언제쯤 받을 수 있을까요?")
                        .build();
                q1.addAnswer("안녕하세요 고객님! 오늘 주문 건은 익일 발송 예정이며, 보통 2-3일 내에 수령 가능하십니다.");

                ProductQna q2 = ProductQna.builder()
                        .userId(userId)
                        .productId(product.getId())
                        .title("재고 문의")
                        .content("혹시 재입고 계획이 있나요?")
                        .build();
                
                productQnaRepository.save(q1);
                productQnaRepository.save(q2);
            }
        });
        log.info("[Init] Reviews and QNAs seeding completed.");
    }

    private Category getOrCreateCategory(String name, Category parent, int displayOrder) {
        Category cat = categoryRepository.findByName(name)
                .orElseGet(() -> {
                    log.info("[Init] Creating new category: {}", name);
                    return categoryRepository.save(new Category(name, parent, displayOrder));
                });
        
        // [추가] 부모 카테고리가 달라졌을 경우 (상위 카테고리 통합 시) 자동 업데이트
        boolean parentChanged = false;
        if (parent == null) {
            if (cat.getParent() != null) parentChanged = true;
        } else {
            if (cat.getParent() == null || !cat.getParent().getId().equals(parent.getId())) {
                parentChanged = true;
            }
        }

        if (parentChanged) {
            log.info("[Init] Updating parent for category: {} -> {}", name, parent != null ? parent.getName() : "Root");
            cat.setParent(parent);
            return categoryRepository.save(cat);
        }

        return cat;
    }

    private void saveProductIfNotExist(String name, String desc, String price, int stock, Category cat, String imageUrl) {
        productRepository.findByName(name).ifPresentOrElse(
            existing -> {
                if (!imageUrl.equals(existing.getMainImageUrl())) {
                    log.info("[Init] Updating image for existing product: {} (Old: {}, New: {})", name, existing.getMainImageUrl(), imageUrl);
                    existing.setMainImageUrl(imageUrl);
                    productRepository.save(existing);
                } else {
                    log.debug("[Init] Product '{}' image already up-to-date.", name);
                }
            },
            () -> {
                log.info("[Init] Registering new product: {} with image: {}", name, imageUrl);
                saveProduct(name, desc, price, stock, cat, imageUrl);
            }
        );
    }

    private void saveProduct(String name, String desc, String price, int stock, Category cat, String imageUrl) {
        java.util.Random random = new java.util.Random();
        Product product = Product.builder()
                .name(name)
                .description(desc)
                .price(new BigDecimal(price))
                .stockQuantity(stock)
                .category(cat)
                .mainImageUrl(imageUrl)
                .salesCount(random.nextInt(1000))
                .viewCount(random.nextInt(5000))
                .build();
        productRepository.save(product);
    }

    private void syncAdminProfile(java.util.UUID userId) {
        log.info("[Init] Starting admin profile sync for user: {}", userId);
        java.util.Map<String, Object> adminProfileMap = new java.util.HashMap<>();
        adminProfileMap.put("fullName", "시스템 관리자");
        adminProfileMap.put("phoneNumber", "01000000000");
        adminProfileMap.put("address", "서울특별시 강남구");
        adminProfileMap.put("detailAddress", "프로젝트 관리 센터");

        try {
            log.debug("[Init] Encrypting admin profile data...");
            String encryptedProfile = kmsService.encryptMap(adminProfileMap);
            log.debug("[Init] Data encryption completed.");

            UserProfile profile = userProfileRepository.findById(userId)
                    .orElseGet(() -> {
                        log.debug("[Init] Creating new UserProfile entity for admin.");
                        return UserProfile.builder().userId(userId).build();
                    });
            
            profile.updateProfile(encryptedProfile, "dummy");
            userProfileRepository.save(profile);
            log.info("[Init] Admin profile successfully synced and saved for user ID: {}", userId);
        } catch (Exception e) {
            log.error("[Init] Failed to sync admin profile for user ID {}: {}", userId, e.getMessage(), e);
        }
    }
}
