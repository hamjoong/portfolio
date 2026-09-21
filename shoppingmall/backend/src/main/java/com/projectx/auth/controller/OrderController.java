package com.projectx.auth.controller;

import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.dto.OrderResponse;
import com.projectx.auth.dto.PaymentRequest;
import com.projectx.auth.dto.ShippingInfoResponse;
import com.projectx.auth.service.MockPaymentService;
import com.projectx.auth.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final MockPaymentService paymentService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal String userId,
            Pageable pageable) {
        log.info("[Order] Fetching orders for user: {}", userId);
        Page<OrderResponse> orders = orderService.getUserOrderDetails(UUID.fromString(userId), pageable);
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
            @RequestParam(required = false) UUID optionId,
            @RequestParam(required = false) Integer quantity,
            @RequestParam String receiverName,
            @RequestParam String phone,
            @RequestParam String address,
            @RequestParam String detailAddress) {
        
        log.info("[Order] Order request for user: {}, productId: {}, optionId: {}, quantity: {}", userId, productId, optionId, quantity);
        UUID orderId = orderService.createOrder(UUID.fromString(userId), productId, optionId, quantity, receiverName, phone, address, detailAddress);
        return ResponseEntity.ok(ApiResponse.success("주문이 완료되었습니다.", orderId));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifyPayment(@Valid @RequestBody PaymentRequest request) {
        log.info("[Order] Payment verification request for order: {}", request.getOrderId());
        boolean isVerified = paymentService.verifyPayment(request);
        return ResponseEntity.ok(ApiResponse.success("결제 검증 결과", isVerified));
    }

    @PostMapping(value = "/{id}/cancel", consumes = "application/json", produces = "application/json")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(@PathVariable UUID id) {
        log.info("[Order] Cancel request for order: {}", id);
        orderService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.success("주문이 취소되었습니다.", null));
    }
}
