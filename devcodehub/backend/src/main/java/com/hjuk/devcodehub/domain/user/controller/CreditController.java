package com.hjuk.devcodehub.domain.user.controller;

import com.hjuk.devcodehub.domain.user.domain.CreditTransaction;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.CreditTransactionRepository;
import com.hjuk.devcodehub.domain.user.repository.SubscriptionRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.domain.user.service.CreditService;
import com.hjuk.devcodehub.domain.user.service.SubscriptionService;
import com.hjuk.devcodehub.global.common.ApiResponse;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/credits")
@RequiredArgsConstructor
@Slf4j
public class CreditController {

  private final UserRepository userRepository;
  private final CreditTransactionRepository transactionRepository;
  private final CreditService creditService;
  private final SubscriptionService subscriptionService;
  private final SubscriptionRepository subscriptionRepository;
  private final com.hjuk.devcodehub.domain.user.service.PaymentService paymentService;

  private static final int DEFAULT_PAGE_SIZE = 10;

  @GetMapping("/balance")
  public ResponseEntity<ApiResponse<CreditBalanceResponse>> getBalance(
      @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
    User entity =
        userRepository
            .findByLoginId(user.getUsername())
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    int totalLimit = entity.getMaxWeeklyFreeLimit();
    if (subscriptionService.isActive(user.getUsername())) {
      var plan =
          subscriptionRepository.findByUserLoginIdAndActiveTrue(user.getUsername()).get().getPlan();
      totalLimit += subscriptionService.getPlanBenefits(plan).get("aiLimit");
    }

    return ResponseEntity.ok(
        ApiResponse.success(
            CreditBalanceResponse.builder()
                .credits(entity.getCredits())
                .totalSpentCredits(entity.getTotalSpentCredits())
                .weeklyFreeReviewUsed(entity.getWeeklyFreeReviewUsed())
                .maxWeeklyFreeLimit(totalLimit)
                .plan(
                    subscriptionRepository
                        .findByUserLoginIdAndActiveTrue(user.getUsername())
                        .map(s -> s.getPlan().name())
                        .orElse(null))
                .build()));
  }

  @GetMapping("/transactions")
  public ResponseEntity<ApiResponse<Page<CreditTransactionResponse>>> getTransactions(
      @AuthenticationPrincipal org.springframework.security.core.userdetails.User user,
      @PageableDefault(size = DEFAULT_PAGE_SIZE) Pageable pageable) {

    Page<CreditTransaction> transactions =
        transactionRepository.findByUserLoginIdOrderByCreatedAtDesc(user.getUsername(), pageable);
    return ResponseEntity.ok(ApiResponse.success(transactions.map(CreditTransactionResponse::new)));
  }

  @PostMapping("/purchase")
  public ResponseEntity<ApiResponse<Void>> purchaseCredits(
      @AuthenticationPrincipal org.springframework.security.core.userdetails.User user,
      @RequestBody java.util.Map<String, Integer> body) {

    int amount = body.getOrDefault("amount", 0);
    if (amount <= 0) {
      throw new BusinessException("충전 금액이 올바르지 않습니다.", ErrorCode.INVALID_INPUT_VALUE);
    }

    creditService.rechargeCredits(user.getUsername(), amount);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @PostMapping("/validate")
  public ResponseEntity<ApiResponse<Void>> validatePayment(
      @AuthenticationPrincipal org.springframework.security.core.userdetails.User user,
      @jakarta.validation.Valid @RequestBody
          com.hjuk.devcodehub.domain.user.dto.PaymentValidationRequest request) {
    log.info("결제 검증 요청 도달: user={}, impUid={}", user.getUsername(), request.getImpUid());
    paymentService.validateAndChargeCredits(user.getUsername(), request);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @Getter
  @Builder
  public static class CreditBalanceResponse {
    private int credits;
    private int totalSpentCredits;
    private int weeklyFreeReviewUsed;
    private int maxWeeklyFreeLimit;
    private String plan;
  }

  @Getter
  public static class CreditTransactionResponse {
    private Long id;
    private String type;
    private String typeDescription;
    private int amount;
    private int balanceAfter;
    private java.time.LocalDateTime createdAt;

    public CreditTransactionResponse(CreditTransaction tx) {
      this.id = tx.getId();
      this.type = tx.getType().name();
      this.typeDescription = tx.getType().getDescription();
      this.amount = tx.getAmount();
      this.balanceAfter = tx.getBalanceAfter();
      this.createdAt = tx.getCreatedAt();
    }
  }
}
