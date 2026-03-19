package com.projectx.auth.controller;

import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * 장바구니 기능을 제공하는 API 컨트롤러입니다.
 * [이유] 사용자가 담은 상품 정보를 서비스 레이어에 전달하고,
 * 일관된 응답 규격(ApiResponse)을 통해 처리 결과를 반환하기 위함입니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * 장바구니에 상품을 추가합니다.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addItem(
            @AuthenticationPrincipal String userId,
            @RequestParam UUID productId,
            @RequestParam int quantity) {
        log.info("[Cart] AddItem Request - UserId: {}, ProductId: {}, Quantity: {}", userId, productId, quantity);
        
        if (userId == null) {
            throw new RuntimeException("인증 정보가 유효하지 않습니다. 다시 로그인해주세요.");
        }
        
        cartService.addItem(UUID.fromString(userId), productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("장바구니에 담겼습니다.", null));
    }

    /**
     * 현재 사용자의 장바구니 목록을 조회합니다.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getCart(@AuthenticationPrincipal String userId) {
        Map<String, Integer> cartItems = cartService.getCartItems(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(cartItems));
    }

    /**
     * 특정 상품을 장바구니에서 삭제합니다.
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeItem(
            @AuthenticationPrincipal String userId,
            @PathVariable UUID productId) {
        cartService.removeItem(UUID.fromString(userId), productId);
        return ResponseEntity.ok(ApiResponse.success("삭제되었습니다.", null));
    }

    /**
     * 비회원 장바구니를 회원 장바구니로 통합합니다.
     */
    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<Void>> mergeCart(
            @AuthenticationPrincipal String userId,
            @RequestParam UUID guestId) {
        log.info("[Cart] Merging guest cart {} into user cart {}", guestId, userId);
        cartService.mergeCart(guestId, UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success("장바구니가 통합되었습니다.", null));
    }
}
