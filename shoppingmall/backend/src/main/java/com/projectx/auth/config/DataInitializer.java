package com.projectx.auth.config;

import com.projectx.auth.domain.entity.Category;
import com.projectx.auth.domain.entity.Product;
import com.projectx.auth.domain.entity.User;
import com.projectx.auth.domain.entity.UserStatus;
import com.projectx.auth.domain.repository.CategoryRepository;
import com.projectx.auth.domain.repository.ProductRepository;
import com.projectx.auth.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * [복구본] 시스템 안정성을 위해 초기 데이터 생성 로직을 단순화했습니다.
 * 데이터가 존재할 경우 재생성하지 않아 상품 ID의 영속성을 보장합니다.
 * [성능 최적화] 배포 환경(prod)에서는 실행되지 않도록 설정하여 타임아웃을 방지합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Profile("!prod")
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CacheManager cacheManager;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting data initialization...");
        
        // 1. 관리자 계정 생성 (없을 경우)
        if (userRepository.findByEmail("admin@projectx.com").isEmpty()) {
            User admin = User.builder()
                    .email("admin@projectx.com")
                    .password("{noop}admin123") // 실제 서비스 시에는 암호화 필수
                    .role("ROLE_ADMIN")
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            log.info("Admin account created.");
        }

        // 2. 카테고리 및 상품 데이터 생성 (기존 데이터가 없을 때만)
        if (categoryRepository.count() == 0) {
            Category electronic = new Category("전자제품", null, 1);
            categoryRepository.save(electronic);

            if (productRepository.count() == 0) {
                Product macbook = Product.builder()
                        .name("MacBook Pro 16")
                        .description("M3 Max 칩 탑재 전문가용 노트북")
                        .price(new BigDecimal("4500000"))
                        .stockQuantity(10)
                        .category(electronic)
                        .build();
                productRepository.save(macbook);
                log.info("Sample product created.");
            }
        }

        log.info("Data initialization completed.");
    }
}
