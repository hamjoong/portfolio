package com.hjuk.devcodehub.domain.user.controller;

import com.hjuk.devcodehub.domain.user.service.SubscriptionService;
import com.hjuk.devcodehub.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/credits")
@RequiredArgsConstructor
public class SubscriptionController {

  private final SubscriptionService subscriptionService;
  private final com.hjuk.devcodehub.domain.user.service.PaymentService paymentService;

  @PostMapping("/unsubscribe")
  public ApiResponse<Void> unsubscribe(
      @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
    subscriptionService.unsubscribe(user.getUsername());
    return ApiResponse.success(null);
  }

  @PostMapping("/subscribe/validate")
  public ApiResponse<Void> validateSubscribe(
      @AuthenticationPrincipal org.springframework.security.core.userdetails.User user,
      @jakarta.validation.Valid @RequestBody
          com.hjuk.devcodehub.domain.user.dto.SubscriptionPlanRequest request) {
    paymentService.validateAndSubscribe(user.getUsername(), request);
    return ApiResponse.success(null);
  }
}
