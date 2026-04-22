package com.hjuk.devcodehub.domain.user.repository;

import com.hjuk.devcodehub.domain.user.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
  Optional<User> findByLoginId(String loginId);

  @Query("SELECT u FROM User u ORDER BY u.level DESC, u.experience DESC")
  List<User> findTopRankedUsers(Pageable pageable);

  /**
   * [Why] 로그인 아이디 존재 여부를 확인합니다.
   *
   * @param loginId 로그인 아이디
   * @return 존재 여부
   */
  boolean existsByLoginId(String loginId);

  /**
   * [Why] 대소문자 구분 없이 로그인 아이디 존재 여부를 확인합니다.
   *
   * @param loginId 로그인 아이디
   * @return 존재 여부
   */
  boolean existsByLoginIdIgnoreCase(String loginId);

  /**
   * [Why] 닉네임 존재 여부를 확인합니다.
   *
   * @param nickname 닉네임
   * @return 존재 여부
   */
  boolean existsByNickname(String nickname);

  /**
   * [Why] 대소문자 구분 없이 닉네임 존재 여부를 확인합니다.
   *
   * @param nickname 닉네임
   * @return 존재 여부
   */
  boolean existsByNicknameIgnoreCase(String nickname);

  /**
   * [Why] 이메일 존재 여부를 확인합니다.
   *
   * @param email 이메일
   * @return 존재 여부
   */
  boolean existsByEmail(String email);

  /**
   * [Why] 대소문자 구분 없이 이메일 존재 여부를 확인합니다.
   *
   * @param email 이메일
   * @return 존재 여부
   */
  boolean existsByEmailIgnoreCase(String email);

  /**
   * [Why] 이메일로 사용자를 찾습니다.
   *
   * @param email 이메일
   * @return 사용자 정보 (Optional)
   */
  Optional<User> findByEmail(String email);

  /**
   * [Why] 이메일과 연락처로 사용자를 찾습니다.
   *
   * @param email 이메일
   * @param contact 연락처
   * @return 사용자 정보 (Optional)
   */
  Optional<User> findByEmailAndContact(String email, String contact);

  /**
   * [Why] 아이디, 이메일, 연락처로 사용자를 찾습니다.
   *
   * @param loginId 로그인 아이디
   * @param email 이메일
   * @param contact 연락처
   * @return 사용자 정보 (Optional)
   */
  Optional<User> findByLoginIdAndEmailAndContact(String loginId, String email, String contact);

  /**
   * [Why] 아이디 목록으로 사용자 목록을 찾습니다.
   *
   * @param loginIds 로그인 아이디 목록
   * @return 사용자 리스트
   */
  List<User> findByLoginIdIn(java.util.Collection<String> loginIds);

  @org.springframework.data.jpa.repository.Modifying
  @org.springframework.data.jpa.repository.Query("UPDATE User u SET u.weeklyFreeReviewUsed = 0")
  int resetAllWeeklyFreeReviewUsed();

  @Query(
      "SELECT CAST(u.createdAt AS date) as date, COUNT(u) as count "
          + "FROM User u WHERE u.createdAt >= :startDate "
          + "GROUP BY CAST(u.createdAt AS date) "
          + "ORDER BY CAST(u.createdAt AS date) ASC")
  List<Object[]> countDailySignups(
      @org.springframework.data.repository.query.Param("startDate")
          java.time.LocalDateTime startDate);

  @Query(
      "SELECT COUNT(u) + 1 FROM User u WHERE u.level > :level OR (u.level = :level AND u.experience > :exp)")
  int countRank(
      @org.springframework.data.repository.query.Param("level") int level,
      @org.springframework.data.repository.query.Param("exp") int exp);

  @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
  List<Object[]> countUsersByRole();

  @EntityGraph(attributePaths = {"badges"})
  @Query(
      "SELECT u FROM User u WHERE "
          + "LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
          + "LOWER(u.loginId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
          + "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
  Page<User> findAllByKeyword(
      @org.springframework.data.repository.query.Param("keyword") String keyword,
      Pageable pageable);
}
