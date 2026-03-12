package com.projectx.auth.controller;

import com.projectx.auth.domain.entity.OrderStatus;
import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * 관리자 전용 기능을 제공하는 컨트롤러입니다.
 * [이유] 대시보드 통계 및 주문 상태 변경 등 사이트 운영에 
 * 필요한 핵심 관리 기능을 제공하기 위함입니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * 대시보드 요약 통계를 조회합니다.
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        log.info("[Admin] Fetching dashboard stats");
        Map<String, Object> stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * 주문 상태를 변경합니다.
     */
    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<Void>> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam OrderStatus status) {
        log.info("[Admin] Updating order {} status to {}", orderId, status);
        adminService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(ApiResponse.success("주문 상태가 변경되었습니다.", null));
    }
}
