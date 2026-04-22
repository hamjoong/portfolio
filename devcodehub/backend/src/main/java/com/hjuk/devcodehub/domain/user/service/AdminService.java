package com.hjuk.devcodehub.domain.user.service;

import com.hjuk.devcodehub.domain.board.domain.Board;
import com.hjuk.devcodehub.domain.board.domain.Comment;
import com.hjuk.devcodehub.domain.board.repository.BoardRepository;
import com.hjuk.devcodehub.domain.board.repository.CommentRepository;
import com.hjuk.devcodehub.domain.notification.event.SeniorVerificationEvent;
import com.hjuk.devcodehub.domain.notification.service.NotificationService;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewRequest;
import com.hjuk.devcodehub.domain.review.domain.SeniorReviewStatus;
import com.hjuk.devcodehub.domain.review.repository.SeniorReviewRequestRepository;
import com.hjuk.devcodehub.domain.user.domain.SeniorVerification;
import com.hjuk.devcodehub.domain.user.domain.VerificationStatus;
import com.hjuk.devcodehub.domain.user.domain.AdminActionType;
import com.hjuk.devcodehub.domain.user.domain.AdminLog;
import com.hjuk.devcodehub.domain.user.domain.CreditTransactionType;
import com.hjuk.devcodehub.domain.user.domain.Role;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.dto.AdminBoardResponse;
import com.hjuk.devcodehub.domain.user.dto.SeniorVerificationResponse;
import com.hjuk.devcodehub.domain.user.dto.UserResponse;
import com.hjuk.devcodehub.domain.user.repository.AdminLogRepository;
import com.hjuk.devcodehub.domain.user.repository.SeniorVerificationRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminService {

  private final UserRepository userRepository;
  private final SeniorVerificationRepository seniorVerificationRepository;
  private final NotificationService notificationService;
  private final BoardRepository boardRepository;
  private final CommentRepository commentRepository;
  private final AdminLogRepository adminLogRepository;
  private final SeniorReviewRequestRepository seniorReviewRequestRepository;
  private final CreditService creditService;
  private final org.springframework.context.ApplicationEventPublisher eventPublisher;

  private static final int DEFAULT_PAGE_SIZE = 10;
  private static final int MAX_CREDIT_ADJUST_AMOUNT = 999999;

  @Transactional(readOnly = true)
  public Page<UserResponse> getAllUsers(String keyword, Pageable pageable) {
    if (keyword != null && !keyword.isBlank()) {
      return userRepository
          .findAll(
              (root, query, cb) -> {
                String[] keywords = keyword.trim().split("\\s+");
                List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
                for (String k : keywords) {
                  String pattern = "%" + k.toLowerCase() + "%";
                  predicates.add(
                      cb.or(
                          cb.like(cb.lower(root.get("nickname").as(String.class)), pattern),
                          cb.like(cb.lower(root.get("loginId").as(String.class)), pattern),
                          cb.like(cb.lower(root.get("email").as(String.class)), pattern)));
                }
                return cb.or(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
              },
              pageable)
          .map(user -> new UserResponse(user, false));
    }
    return userRepository.findAll(pageable).map(user -> new UserResponse(user, false));
  }

  public void adjustCredits(String loginId, int amount, String reason, String adminLoginId) {
    User admin =
        userRepository
            .findByLoginId(adminLoginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    User target =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    if (amount > MAX_CREDIT_ADJUST_AMOUNT) {
      throw new BusinessException(
          "한 번에 " + MAX_CREDIT_ADJUST_AMOUNT + " C를 초과하여 지급할 수 없습니다.",
          ErrorCode.INVALID_INPUT_VALUE);
    }

    if (amount < 0 && Math.abs(amount) > target.getCredits()) {
      throw new BusinessException("보유 잔액보다 많은 금액을 차감할 수 없습니다.", ErrorCode.INVALID_INPUT_VALUE);
    }

    if (amount > 0) {
      creditService.earnCredits(
          loginId, amount, CreditTransactionType.ADMIN_ADJUST, target.getId());
    } else if (amount < 0) {
      creditService.spendCredits(
          loginId, Math.abs(amount), CreditTransactionType.ADMIN_ADJUST, target.getId());
    }

    adminLogRepository.save(
        AdminLog.builder()
            .admin(admin)
            .targetUser(target)
            .actionType(AdminActionType.CREDIT_ADJUST)
            .reason(reason + " (금액: " + amount + ")")
            .build());
  }

  public void cancelReviewAndRefund(Long requestId, String reason, String adminLoginId) {
    User admin =
        userRepository
            .findByLoginId(adminLoginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    SeniorReviewRequest request =
        seniorReviewRequestRepository
            .findById(requestId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

    if (request.getStatus() == SeniorReviewStatus.COMPLETED) {
      throw new BusinessException("이미 완료된 리뷰는 취소할 수 없습니다.", ErrorCode.INVALID_INPUT_VALUE);
    }

    creditService.earnCredits(
        request.getJunior().getLoginId(),
        request.getCredits(),
        CreditTransactionType.RECHARGE,
        requestId);

    request.cancel();
    seniorReviewRequestRepository.save(request);

    adminLogRepository.save(
        AdminLog.builder()
            .admin(admin)
            .targetUser(request.getJunior())
            .actionType(AdminActionType.REVIEW_CANCEL)
            .reason("리뷰 취소 및 환불: " + reason)
            .build());

    notificationService.sendRealTimeNotification(
        request.getJunior().getLoginId(), "[리뷰 취소] 시니어 리뷰 요청이 관리자에 의해 취소 및 환불되었습니다.");
  }

  @Transactional(readOnly = true)
  public List<SeniorVerificationResponse> getPendingVerifications() {
    return seniorVerificationRepository.findByStatus(VerificationStatus.PENDING).stream()
        .map(SeniorVerificationResponse::new)
        .collect(Collectors.toList());
  }

  public void approveSenior(Long verificationId) {
    SeniorVerification verification =
        seniorVerificationRepository
            .findById(verificationId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

    if (verification.getStatus() != VerificationStatus.PENDING) {
      throw new BusinessException("이미 처리된 요청입니다.", ErrorCode.INVALID_INPUT_VALUE);
    }

    verification.approve();
    User user = verification.getUser();
    user.updateRole(Role.SENIOR);

    userRepository.save(user);
    seniorVerificationRepository.save(verification);

    eventPublisher.publishEvent(
        new SeniorVerificationEvent(
            SeniorVerificationEvent.Type.APPROVED, user.getLoginId(), user.getNickname(), null));
  }

  public void rejectSenior(Long verificationId, String reason) {
    SeniorVerification verification =
        seniorVerificationRepository
            .findById(verificationId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

    if (verification.getStatus() != VerificationStatus.PENDING) {
      throw new BusinessException("이미 처리된 요청입니다.", ErrorCode.INVALID_INPUT_VALUE);
    }

    verification.reject(reason);
    seniorVerificationRepository.save(verification);

    eventPublisher.publishEvent(
        new SeniorVerificationEvent(
            SeniorVerificationEvent.Type.REJECTED,
            verification.getUser().getLoginId(),
            verification.getUser().getNickname(),
            reason));
  }

  public void deleteBoard(Long boardId, String adminLoginId) {
    User admin =
        userRepository
            .findByLoginId(adminLoginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    Board board =
        boardRepository
            .findById(boardId)
            .orElseThrow(() -> new BusinessException(ErrorCode.BOARD_NOT_FOUND));

    adminLogRepository.save(
        AdminLog.builder()
            .admin(admin)
            .targetUser(board.getAuthor())
            .actionType(AdminActionType.BOARD_DELETE)
            .reason("게시글 강제 삭제: " + board.getTitle())
            .build());

    boardRepository.delete(board);
  }

  public void deleteComment(Long commentId, String adminLoginId) {
    User admin =
        userRepository
            .findByLoginId(adminLoginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    Comment comment =
        commentRepository
            .findById(commentId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));

    adminLogRepository.save(
        AdminLog.builder()
            .admin(admin)
            .targetUser(comment.getAuthor())
            .actionType(AdminActionType.COMMENT_DELETE)
            .reason("댓글 강제 삭제 (내용 치환 처리)")
            .build());

    comment.update("관리자에 의해 삭제된 댓글입니다.");
    commentRepository.save(comment);
  }

  @Transactional(readOnly = true)
  public Page<com.hjuk.devcodehub.domain.user.dto.AdminLogResponse> getAuditLogs(
      String keyword, Pageable pageable) {
    if (keyword != null && !keyword.isBlank()) {
      return adminLogRepository
          .findAll(
              (root, query, cb) -> {
                String[] keywords = keyword.trim().split("\\s+");
                List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
                for (String k : keywords) {
                  String pattern = "%" + k.toLowerCase() + "%";
                  predicates.add(
                      cb.or(
                          cb.like(cb.lower(root.join("admin").get("nickname").as(String.class)), pattern),
                          cb.like(cb.lower(root.join("targetUser").get("nickname").as(String.class)), pattern),
                          cb.like(cb.lower(root.get("reason").as(String.class)), pattern)));
                }
                return cb.or(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
              },
              pageable)
          .map(com.hjuk.devcodehub.domain.user.dto.AdminLogResponse::new);
    }
    return adminLogRepository
        .findAll(pageable)
        .map(com.hjuk.devcodehub.domain.user.dto.AdminLogResponse::new);
  }

  @Transactional(readOnly = true)
  public Page<AdminBoardResponse> getAllBoards(String keyword, Pageable pageable) {
    if (keyword != null && !keyword.isBlank()) {
      return boardRepository
          .findAll(
              (root, query, cb) -> {
                String[] keywords = keyword.trim().split("\\s+");
                List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
                for (String k : keywords) {
                  String pattern = "%" + k.toLowerCase() + "%";
                  predicates.add(
                      cb.or(
                          cb.like(cb.lower(root.get("title").as(String.class)), pattern),
                          cb.like(cb.lower(root.join("author").get("nickname").as(String.class)), pattern)));
                }
                return cb.or(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
              },
              pageable)
          .map(AdminBoardResponse::new);
    }
    return boardRepository.findAllWithAuthor(pageable).map(AdminBoardResponse::new);
  }
}
