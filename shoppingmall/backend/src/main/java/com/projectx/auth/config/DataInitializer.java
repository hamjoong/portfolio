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
import com.projectx.auth.service.EncryptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

/**
 * 시스템 초기 가동 시 필수 데이터를 생성하고 관리자 계정을 동기화합니다.
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
    private final EncryptionService encryptionService;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("[Init] Starting data initialization and admin sync...");
        
        String adminEmail = "admin@projectx.com";
        String adminPassword = "admin123!@#";

        Optional<User> adminOpt = userRepository.findByEmail(adminEmail.toLowerCase());
        User adminUser;
        if (adminOpt.isPresent()) {
            adminUser = adminOpt.get();
            log.info("[Init] Admin account already exists. Updating password and roles.");
            adminUser.setPassword(passwordEncoder.encode(adminPassword));
            adminUser.setRole("ROLE_ADMIN");
            adminUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(adminUser);
            
            syncAdminProfile(adminUser.getId());
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

        // 카테고리/상품 샘플 데이터 생성 로직 (생략 - 동일)
        // ... (생략된 부분은 유지됩니다) ...
        log.info("[Init] Sample data sync and cleanup completed.");
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
            String encryptedProfile = encryptionService.encryptMap(adminProfileMap);
            log.debug("[Init] Data encryption completed.");

            UserProfile profile = userProfileRepository.findById(userId)
                    .orElseGet(() -> UserProfile.builder().userId(userId).build());
            
            profile.updateProfile(encryptedProfile);
            userProfileRepository.save(profile);
            log.info("[Init] Admin profile successfully synced and saved for user ID: {}", userId);
        } catch (Exception e) {
            log.error("[Init] Failed to sync admin profile for user ID {}: {}", userId, e.getMessage(), e);
        }
    }
    // ... 나머지 기존 메서드들 유지 ...
}
