package com.projectx.auth.controller;

import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.dto.OrderResponse;
import com.projectx.auth.dto.ShippingInfoResponse;
import com.projectx.auth.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(@AuthenticationPrincipal String userId) {
        log.info("[Order] Fetching orders for user: {}", userId);
        List<OrderResponse> orders = orderService.getUserOrderDetails(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    /**
     * 가장 최근 배송 정보를 조회합니다.
     */
    @GetMapping("/recent-shipping")
    public ResponseEntity<ApiResponse<ShippingInfoResponse>> getRecentShipping(@AuthenticationPrincipal String userId) {
        log.info("[Order] Fetching recent shipping info for user: {}", userId);
        ShippingInfoResponse response = orderService.getRecentShippingInfo(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable UUID id) {
        log.info("[Order] Fetching details for order: {}", id);
        OrderResponse response = orderService.getOrderDetails(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UUID>> createOrder(
            @AuthenticationPrincipal String userId,
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) Integer quantity,
            @RequestParam String receiverName,
            @RequestParam String phone,
            @RequestParam String address,
            @RequestParam String detailAddress) {
        
        log.info("[Order] Order request for user: {}, productId: {}, quantity: {}", userId, productId, quantity);
        UUID orderId = orderService.createOrder(UUID.fromString(userId), productId, quantity, receiverName, phone, address, detailAddress);
        return ResponseEntity.ok(ApiResponse.success("주문이 완료되었습니다.", orderId));
    }
}
