package com.hjuk.devcodehub.domain.notification.repository;

import com.hjuk.devcodehub.domain.notification.domain.Notification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  List<Notification> findByUserLoginIdOrderByCreatedAtDesc(String loginId);

  // [Why] 파생 delete(deleteBy...)는 행을 모두 읽은 뒤 하나씩 지운다. 벌크 DELETE 한 번으로 처리한다.
  @Modifying(clearAutomatically = true)
  @Query("DELETE FROM Notification n WHERE n.createdAt < :expiryTime")
  int deleteExpired(@Param("expiryTime") java.time.LocalDateTime expiryTime);

  @Modifying(clearAutomatically = true)
  @Query(
      "DELETE FROM Notification n WHERE n.user.loginId = :loginId "
          + "AND n.content LIKE CONCAT('%', :keyword, '%')")
  int deleteByUserAndContentContaining(
      @Param("loginId") String loginId, @Param("keyword") String keyword);

  @Modifying(clearAutomatically = true)
  @Query("DELETE FROM Notification n WHERE n.content LIKE CONCAT('%', :keyword, '%')")
  int deleteByContentContaining(@Param("keyword") String keyword);
}
