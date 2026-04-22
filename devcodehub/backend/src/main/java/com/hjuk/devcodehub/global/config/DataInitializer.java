package com.hjuk.devcodehub.global.config;

import com.hjuk.devcodehub.domain.board.domain.Board;
import com.hjuk.devcodehub.domain.board.domain.BoardType;
import com.hjuk.devcodehub.domain.board.domain.Comment;
import com.hjuk.devcodehub.domain.board.repository.BoardRepository;
import com.hjuk.devcodehub.domain.board.repository.CommentRepository;
import com.hjuk.devcodehub.domain.user.domain.Badge;
import com.hjuk.devcodehub.domain.user.domain.BadgeConditionType;
import com.hjuk.devcodehub.domain.user.domain.Role;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.BadgeRepository;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** [Why] 애플리케이션 기동 시 초기 데이터 및 부하 테스트용 더미 데이터를 생성합니다. */
@Component
@RequiredArgsConstructor
public class DataInitializer {

  private static final int XP_BADGE_THRESHOLD = 2000;
  private static final int REVIEW_BADGE_THRESHOLD = 10;
  private static final int COMMENT_BADGE_THRESHOLD = 30;
  private static final int ADMIN_INITIAL_CREDITS = 999999;
  private static final int DUMMY_USER_COUNT = 50;
  private static final int DUMMY_POST_COUNT = 200;
  private static final int DUMMY_COMMENT_PER_POST = 3;
  private static final int DUMMY_INITIAL_CREDITS = 1000;
  private static final int DUMMY_CONTENT_REPEAT_COUNT = 5;

  private final BadgeRepository badgeRepository;
  private final UserRepository userRepository;
  private final BoardRepository boardRepository;
  private final CommentRepository commentRepository;
  private final PasswordEncoder passwordEncoder;
  private final Environment env;

  @Value("${ADMIN_ID:admin}")
  private String adminId;

  @Value("${ADMIN_PASSWORD:admin123!}")
  private String adminPassword;

  /** [Why] 컨텍스트 로드가 완료된 후 데이터를 초기화합니다. */
  @EventListener(ContextRefreshedEvent.class)
  @Transactional
  public void init() {
    initBadges();
    initAdmin();
    // [Why] 부하 테스트 준비: local 프로파일에서만 대량 더미 데이터 생성
    if (Arrays.asList(env.getActiveProfiles()).contains("local")) {
      initDummyData();
    }
  }

  private void initDummyData() {
    // 1. 더미 사용자 생성 (없을 때만)
    List<User> dummyUsers = new ArrayList<>();
    for (int i = 1; i <= DUMMY_USER_COUNT; i++) {
      final int userIndex = i;
      String loginId = "user" + userIndex;
      userRepository.findByLoginId(loginId).ifPresentOrElse(
          dummyUsers::add,
          () -> {
            User user = User.builder()
                .loginId(loginId)
                .password(passwordEncoder.encode("password123!"))
                .nickname("테스터" + userIndex)
                .email(loginId + "@example.com")
                .role(Role.USER)
                .credits(DUMMY_INITIAL_CREDITS)
                .build();
            dummyUsers.add(userRepository.save(user));
          }
      );
    }

    // 2. 더미 게시글 생성 (이미 데이터가 충분하면 스킵)
    if (boardRepository.count() > DUMMY_POST_COUNT) {
      return;
    }

    List<Board> dummyBoards = new ArrayList<>();
    for (int i = 1; i <= DUMMY_POST_COUNT; i++) {
      User author = dummyUsers.get(i % dummyUsers.size());
      BoardType type = (i % 2 == 0) ? BoardType.SKILL : BoardType.AI;

      Board board = Board.builder()
          .title("부하 테스트용 더미 게시글 " + i)
          .content("테스트 콘텐츠입니다. " + "반복 ".repeat(DUMMY_CONTENT_REPEAT_COUNT))
          .type(type)
          .author(author)
          .tags(List.of("Test", type.name()))
          .build();
      dummyBoards.add(boardRepository.save(board));
    }

    // 3. 각 게시글에 더미 댓글 생성
    for (Board board : dummyBoards) {
      for (int k = 1; k <= DUMMY_COMMENT_PER_POST; k++) {
        User commenter = dummyUsers.get((board.getId().intValue() + k) % dummyUsers.size());
        Comment comment = Comment.builder()
            .board(board)
            .author(commenter)
            .content("게시글에 대한 " + k + "번째 테스트 댓글입니다.")
            .build();
        commentRepository.save(comment);
      }
    }
  }

  private void initBadges() {
    if (badgeRepository.count() == 0) {
      saveBadge("FIRST_POST", "첫 게시글 작성", BadgeConditionType.POST_COUNT, 1);
      saveBadge("MASTER_DEV", "총 " + XP_BADGE_THRESHOLD + " XP 달성", BadgeConditionType.XP, XP_BADGE_THRESHOLD);
      saveBadge("REVIEW_MASTER", "AI 리뷰 " + REVIEW_BADGE_THRESHOLD + "회 완료",
          BadgeConditionType.REVIEW_COUNT, REVIEW_BADGE_THRESHOLD);
      saveBadge("COMMUNITY_KING", "댓글 " + COMMENT_BADGE_THRESHOLD + "회 작성",
          BadgeConditionType.COMMENT_COUNT, COMMENT_BADGE_THRESHOLD);
    }
  }

  private void saveBadge(String name, String desc, BadgeConditionType type, int threshold) {
    badgeRepository.save(Badge.builder()
        .name(name)
        .description(desc)
        .conditionType(type)
        .threshold(threshold)
        .build());
  }

  private void initAdmin() {
    if (userRepository.findByLoginId(adminId).isEmpty()) {
      userRepository.save(User.builder()
          .loginId(adminId)
          .password(passwordEncoder.encode(adminPassword))
          .nickname("관리자")
          .email("admin@devcodehub.com")
          .role(Role.ADMIN)
          .credits(ADMIN_INITIAL_CREDITS)
          .build());
    }
  }
}
