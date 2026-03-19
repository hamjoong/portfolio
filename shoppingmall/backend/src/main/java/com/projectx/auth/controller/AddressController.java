package com.projectx.auth.controller;

import com.projectx.auth.dto.AddressRequest;
import com.projectx.auth.dto.AddressResponse;
import com.projectx.auth.dto.ApiResponse;
import com.projectx.auth.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * 사용자의 배송지 관리 기능을 제공하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/v1/users/me/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    /**
     * 나의 배송지 목록을 조회합니다.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getMyAddresses(@AuthenticationPrincipal String userId) {
        List<AddressResponse> addresses = addressService.getMyAddresses(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    /**
     * 새로운 배송지를 등록합니다.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UUID>> addAddress(@AuthenticationPrincipal String userId, 
                                       @RequestBody AddressRequest request) {
        UUID addressId = addressService.addAddress(UUID.fromString(userId), request);
        return ResponseEntity.ok(ApiResponse.success("배송지가 성공적으로 등록되었습니다.", addressId));
    }

    /**
     * 배송지 정보를 수정합니다.
     */
    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> updateAddress(@AuthenticationPrincipal String userId, 
                                          @PathVariable UUID addressId,
                                          @RequestBody AddressRequest request) {
        addressService.updateAddress(UUID.fromString(userId), addressId, request);
        return ResponseEntity.ok(ApiResponse.success("배송지 정보가 수정되었습니다.", null));
    }

    /**
     * 배송지를 삭제합니다.
     */
    @DeleteMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@AuthenticationPrincipal String userId, 
                                          @PathVariable UUID addressId) {
        addressService.deleteAddress(UUID.fromString(userId), addressId);
        return ResponseEntity.ok(ApiResponse.success("배송지가 삭제되었습니다.", null));
    }
}
