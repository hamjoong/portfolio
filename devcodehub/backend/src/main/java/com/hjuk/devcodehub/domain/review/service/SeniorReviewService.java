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

    java.util.Map<Long, Long> counts = new java.util.HashMap<>();
    if (!requests.isEmpty()) {
      applicationRepository
          .countByRequestIds(requests.getContent().stream().map(SeniorReviewRequest::getId).toList())
          .forEach(row -> counts.put((Long) row[0], (Long) row[1]));
    }
    return requests.map(req -> new SeniorReviewResponse(req, counts.getOrDefault(req.getId(), 0L)));
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

    // [Why] 지원자 목록은 요청 작성자(주니어)만 볼 수 있다.
    if (!request.getJunior().getLoginId().equals(loginId) && !isAdmin(loginId)) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }

    return applicationRepository.findByRequest(request).stream()
        .map(SeniorReviewApplicationResponse::new)
        .collect(Collectors.toList());
  }

  public void acceptApplication(Long requestId, Long applicationId, String loginId) {
    SeniorReviewRequest request =
        requestRepository
            .findByIdForUpdate(requestId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

    if (!request.getJunior().getLoginId().equals(loginId)) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }

    // [Why] 이미 매칭·완료된 요청을 다시 매칭하면 다른 시니어로 바뀌어 정산이 반복될 수 있다.
    if (request.getStatus() != SeniorReviewStatus.PENDING) {
      throw new BusinessException(ErrorCode.INVALID_REVIEW_STATUS);
    }

    SeniorReviewApplication application =
        applicationRepository
            .findById(applicationId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

    // [Why] 다른 요청의 지원서 id를 넘겨 엉뚱한 시니어를 매칭하는 것을 막는다.
    if (!application.getRequest().getId().equals(requestId)) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }

    request.matchWithSenior(application.getSenior());
    requestRepository.save(request);

    eventPublisher.publishEvent(
        new com.hjuk.devcodehub.domain.notification.event.SeniorMatchedEvent(
            request.getJunior().getLoginId(),
            application.getSenior().getNickname(),
            request.getTitle()));
  }

  public void completeReview(Long requestId, String loginId, String content) {
    if (content == null || content.isBlank()) {
      throw new BusinessException("리뷰 내용을 입력해 주세요.", ErrorCode.INVALID_INPUT_VALUE);
    }

    SeniorReviewRequest request =
        requestRepository
            .findByIdForUpdate(requestId)
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

  private void settleCredits(SeniorReviewRequest request) {
    User senior = request.getSenior();
    int totalCredits = request.getCredits();
    int commission = (int) (totalCredits * COMMISSION_RATE);
    int netAmount = totalCredits - commission;

    creditService.earnCredits(
        senior.getLoginId(), netAmount, CreditTransactionType.EARN_REVIEW, request.getId());
    creditService.recordTransaction(
        senior.getLoginId(), -commission, CreditTransactionType.COMMISSION, request.getId());
  }

  @Transactional(readOnly = true)
  public SeniorReviewResultResponse getReviewResult(Long requestId, String loginId) {
    SeniorReviewRequest request =
        requestRepository
            .findById(requestId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

    // [Why] 유료 리뷰 결과는 요청자·담당 시니어·관리자만 볼 수 있다.
    boolean isJunior = request.getJunior().getLoginId().equals(loginId);
    boolean isSenior = request.getSenior() != null && request.getSenior().getLoginId().equals(loginId);
    if (!isJunior && !isSenior && !isAdmin(loginId)) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }

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

  private boolean isAdmin(String loginId) {
    return userRepository
        .findByLoginId(loginId)
        .map(u -> u.getRole() == Role.ADMIN)
        .orElse(false);
  }
}
