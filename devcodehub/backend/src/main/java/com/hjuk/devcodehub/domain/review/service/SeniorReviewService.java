package com.hjuk.devcodehub.domain.review.service;

import com.hjuk.devcodehub.domain.review.domain.SeniorReview;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewApplication;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewRequest;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewStatus;
import com.hjuk.devcodehub.domain.review.dto.SeniorReviewApplicationResponse;
import com.hjuk.devcodehub.domain.review.dto.SeniorReviewRequestDto;
import com.hjuk.devcodehub.domain.review.dto.SeniorReviewResponse;
import com.hjuk.devcodehub.domain.review.dto.SeniorReviewResultResponse;
import com.hjuk.devcodehub.domain.review.repository.SeniorReviewApplicationRepository;
import com.hjuk.devcodehub.domain.review.repository.SeniorReviewRepository;
import com.hjuk.devcodehub.domain.review.repository.SeniorReviewRequestRepository;
import com.hjuk.devcodehub.domain.user.domain.CreditTransactionType;
import com.hjuk.devcodehub.domain.user.domain.Role;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.domain.user.service.CreditService;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class SeniorReviewService {

  private final SeniorReviewRequestRepository requestRepository;
  private final SeniorReviewApplicationRepository applicationRepository;
  private final SeniorReviewRepository reviewRepository;
  private final UserRepository userRepository;
  private final CreditService creditService;
  private final com.hjuk.devcodehub.domain.user.service.ActivityService activityService;
  private final ApplicationEventPublisher eventPublisher;

  private static final double COMMISSION_RATE = 0.1; // 10% 수수료
  private static final int XP_PER_SENIOR_REVIEW = 50;
  private static final int MIN_SENIOR_REVIEW_CREDITS = 100;

  public Long createRequest(SeniorReviewRequestDto dto, String loginId) {
    User junior =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    if (dto.getCredits() < MIN_SENIOR_REVIEW_CREDITS) {
      throw new BusinessException(
          "최소 " + MIN_SENIOR_REVIEW_CREDITS + " 크레딧 이상 설정해야 합니다.",
          ErrorCode.INVALID_INPUT_VALUE);
    }

    if (junior.getCredits() < dto.getCredits()) {
      throw new BusinessException("잔여 크레딧이 부족합니다.", ErrorCode.HANDLE_ACCESS_DENIED);
    }

    creditService.spendCredits(loginId, dto.getCredits(), CreditTransactionType.SPEND_SENIOR, null);

    SeniorReviewRequest request =
        SeniorReviewRequest.builder()
            .junior(junior)
            .title(dto.getTitle())
            .content(dto.getContent())
            .codeContent(dto.getCodeContent())
            .language(dto.getLanguage())
            .tags(dto.getTags())
            .credits(dto.getCredits())
            .build();

    Long requestId = requestRepository.save(request).getId();

    eventPublisher.publishEvent(
        new com.hjuk.devcodehub.domain.notification.event.SeniorReviewRequestedEvent(
            junior.getNickname(), request.getTitle()));

    return requestId;
  }

  @Transactional(readOnly = true)
  public Page<SeniorReviewResponse> getRequests(SeniorReviewStatus status, Pageable pageable) {
    Page<SeniorReviewRequest> requests =
        (status == null)
            ? requestRepository.findAll(pageable)
            : requestRepository.findByStatus(status, pageable);

    return requests.map(
        req -> new SeniorReviewResponse(req, applicationRepository.countByRequest(req)));
  }

  @Transactional(readOnly = true)
  public SeniorReviewResponse getRequestDetail(Long id) {
    SeniorReviewRequest request =
        requestRepository
            .findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
    return new SeniorReviewResponse(request, applicationRepository.countByRequest(request));
  }

  public void applyForRequest(Long requestId, String loginId, String message) {
    User senior =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    if (!senior.getRole().equals(Role.SENIOR) && !senior.getRole().equals(Role.ADMIN)) {
      throw new BusinessException(ErrorCode.NOT_A_SENIOR);
    }

    SeniorReviewRequest request =
        requestRepository
            .findById(requestId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

    if (request.getStatus() != SeniorReviewStatus.PENDING) {
      throw new BusinessException(ErrorCode.INVALID_REVIEW_STATUS);
    }

    if (applicationRepository.findByRequestIdAndSeniorId(requestId, senior.getId()).isPresent()) {
      throw new BusinessException(ErrorCode.ALREADY_APPLIED);
    }

    SeniorReviewApplication application =
        SeniorReviewApplication.builder().request(request).senior(senior).message(message).build();

    applicationRepository.save(application);
  }

  @Transactional(readOnly = true)
  public List<SeniorReviewApplicationResponse> getApplications(Long requestId, String loginId) {
    SeniorReviewRequest request =
        requestRepository
            .findById(requestId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

    return applicationRepository.findByRequest(request).stream()
        .map(SeniorReviewApplicationResponse::new)
        .collect(Collectors.toList());
  }

  public void acceptApplication(Long requestId, Long applicationId, String loginId) {
    SeniorReviewRequest request =
        requestRepository
            .findById(requestId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

    if (!request.getJunior().getLoginId().equals(loginId)) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }

    SeniorReviewApplication application =
        applicationRepository
            .findById(applicationId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

    request.matchWithSenior(application.getSenior());
    requestRepository.save(request);

    eventPublisher.publishEvent(
        new com.hjuk.devcodehub.domain.notification.event.SeniorMatchedEvent(
            request.getJunior().getLoginId(),
            application.getSenior().getNickname(),
            request.getTitle()));
  }

  public void completeReview(Long requestId, String loginId, String content) {
    SeniorReviewRequest request =
        requestRepository
            .findById(requestId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

    if (request.getSenior() == null || !request.getSenior().getLoginId().equals(loginId)) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }

    if (request.getStatus() != SeniorReviewStatus.MATCHED) {
      throw new BusinessException(ErrorCode.INVALID_REVIEW_STATUS);
    }

    saveReview(request, content);
    settleCredits(request);
    activityService.recordActivity(loginId, XP_PER_SENIOR_REVIEW);

    // 알림 이벤트 발행 (기존 로직 유지)
    eventPublisher.publishEvent(
        new com.hjuk.devcodehub.domain.notification.event.ReviewCompletedEvent(
            request.getId(), request.getJunior().getLoginId(), request.getTitle()));
  }

  private void saveReview(SeniorReviewRequest request, String content) {
    SeniorReview review =
        SeniorReview.builder()
            .request(request)
            .senior(request.getSenior())
            .content(content)
            .build();
    reviewRepository.save(review);
    request.completeReview();
    requestRepository.save(request);
  }

  /**
   * [Why] 리뷰 완료 시 시니어에게 수수료(10%)를 제외한 크레딧을 정산합니다.
   *
   * @param request 시니어 리뷰 요청 객체
   */
  private void settleCredits(SeniorReviewRequest request) {
    User senior = request.getSenior();
    int totalCredits = request.getCredits();
    // [Why] 수수료 계산 시 반올림을 적용하여 정산 금액의 공정성을 확보함.
    int commission = (int) Math.round(totalCredits * COMMISSION_RATE);
    int netAmount = totalCredits - commission;

    // 시니어 수익 지급
    creditService.earnCredits(
        senior.getLoginId(), netAmount, CreditTransactionType.EARN_REVIEW, request.getId());

    // 플랫폼 수수료 기록 (별도 차감 트랜잭션으로 남겨 통계에 활용)
    creditService.recordTransaction(
        senior.getLoginId(), -commission, CreditTransactionType.COMMISSION, request.getId());
  }

  @Transactional(readOnly = true)
  public SeniorReviewResultResponse getReviewResult(Long requestId) {
    SeniorReview review =
        reviewRepository
            .findByRequestId(requestId)
            .orElseThrow(() -> new BusinessException(ErrorCode.REVIEW_NOT_FOUND));
    return new SeniorReviewResultResponse(review);
  }

  public void rateReview(Long requestId, String loginId, int rating) {
    SeniorReviewRequest request =
        requestRepository
            .findById(requestId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

    if (!request.getJunior().getLoginId().equals(loginId)) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }

    SeniorReview review =
        reviewRepository
            .findByRequestId(requestId)
            .orElseThrow(() -> new BusinessException(ErrorCode.REVIEW_NOT_FOUND));

    review.setRating(rating);
    reviewRepository.save(review);
  }
}
