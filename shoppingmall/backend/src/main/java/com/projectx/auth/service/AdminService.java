package com.projectx.auth.service;

import com.projectx.auth.domain.entity.Order;
import com.projectx.auth.domain.entity.OrderStatus;
import com.projectx.auth.domain.entity.Product;
import com.projectx.auth.domain.entity.User;
import com.projectx.auth.domain.entity.UserProfile;
import com.projectx.auth.domain.repository.OrderRepository;
import com.projectx.auth.domain.repository.ProductRepository;
import com.projectx.auth.domain.repository.UserRepository;
import com.projectx.auth.domain.repository.UserProfileRepository;
import com.projectx.auth.dto.ProductResponse;
import com.projectx.auth.dto.UserDetailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * 관리자 전용 비즈니스 로직을 담당하는 핵심 서비스입니다.
 * [보안] 민감한 개인정보를 안전하게 복호화하여 관리자 대시보드에 제공합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final KmsService kmsService;

    /**
     * 전체 사용자의 상세 정보(개인정보 포함)를 조회합니다.
     */
    @Transactional(readOnly = true)
    public Page<UserDetailResponse> getAllUsers(Pageable pageable) {
        log.info("[Admin] Fetching all users with decrypted profiles");
        return userRepository.findAll(pageable).map(user -> {
            Optional<UserProfile> profileOpt = userProfileRepository.findById(user.getId());
            
            UserDetailResponse.UserDetailResponseBuilder builder = UserDetailResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .status(user.getStatus())
                    .role(user.getRole())
                    .lastLoginAt(user.getLastLoginAt())
                    .createdAt(user.getCreatedAt());

            profileOpt.ifPresent(profile -> {
                try {
                    Map<String, Object> data = kmsService.decryptToMap(profile.getEncryptedData());
                    builder.fullName((String) data.getOrDefault("fullName", ""))
                           .phoneNumber((String) data.getOrDefault("phoneNumber", ""))
                           .address((String) data.getOrDefault("address", ""))
                           .detailAddress((String) data.getOrDefault("detailAddress", ""));
                } catch (Exception e) {
                    log.error("[Admin] Failed to decrypt profile for user: {}", user.getId(), e.getMessage());
                }
            });

            return builder.build();
        });
    }

    /**
     * 전체 상품 상세 정보를 조회합니다.
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(ProductResponse::from);
    }

    /**
     * 대시보드 통계 데이터를 집계합니다.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalOrders = orderRepository.count();
        BigDecimal totalSales = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        stats.put("totalOrders", totalOrders);
        stats.put("totalSales", totalSales);
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProducts", productRepository.count());
        
        return stats;
    }

    @Transactional
    public void updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));
        order.updateStatus(newStatus);
        log.info("[Admin] Order {} status updated to {}", orderId, newStatus);
    }
}

