package com.projectx.auth.controller;

import com.projectx.auth.domain.entity.OrderStatus;
import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.dto.ProductResponse;
import com.projectx.auth.dto.UserDetailResponse;
import com.projectx.auth.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * 관리자 전용 기능을 수행하는 컨트롤러입니다.
 * [보안] SecurityConfig에 의해 ROLE_ADMIN 권한 소지자만 접근할 수 있도록 엄격히 통제됩니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * 대시보드 요약 데이터를 조회합니다.
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        log.info("[Admin] Dashboard stats requested");
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    /**
     * 모든 사용자의 상세 정보(개인정보 복호화 포함)를 조회합니다.
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserDetailResponse>>> getAllUsers(Pageable pageable) {
        log.info("[Admin] User management list requested");
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers(pageable)));
    }

    /**
     * 모든 상품의 상세 정보를 조회합니다.
     */
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(Pageable pageable) {
        log.info("[Admin] Product management list requested");
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllProducts(pageable)));
    }

    /**
     * 주문 상태를 강제로 변경합니다.
     */
    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<Void>> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam OrderStatus status) {
        log.info("[Admin] Strategic status update for order: {}", orderId);
        adminService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(ApiResponse.success("상태가 성공적으로 변경되었습니다.", null));
    }
}

