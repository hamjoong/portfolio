package com.hjuk.devcodehub.domain.user.dto;

import com.hjuk.devcodehub.domain.user.domain.AdminLog;
import java.time.LocalDateTime;
import lombok.Getter;

@Getter
public class AdminLogResponse {
  private Long id;
  private String adminNickname;
  private String adminLoginId;
  private String targetUserNickname;
  private String targetUserLoginId;
  private String actionType;
  private String actionDescription;
  private String reason;
  private LocalDateTime createdAt;

  public AdminLogResponse(AdminLog log) {
    this.id = log.getId();
    this.adminNickname = log.getAdmin().getNickname();
    this.adminLoginId = log.getAdmin().getLoginId();
    if (log.getTargetUser() != null) {
      this.targetUserNickname = log.getTargetUser().getNickname();
      this.targetUserLoginId = log.getTargetUser().getLoginId();
    }
    this.actionType = log.getActionType().name();
    this.actionDescription = log.getActionType().getDescription();
    this.reason = log.getReason();
    this.createdAt = log.getCreatedAt();
  }
}
