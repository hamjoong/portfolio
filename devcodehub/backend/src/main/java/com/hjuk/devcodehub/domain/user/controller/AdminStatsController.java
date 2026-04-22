package com.hjuk.devcodehub.domain.user.controller;

import com.hjuk.devcodehub.domain.user.dto.AdminStatsResponse;
import com.hjuk.devcodehub.domain.user.service.AdminStatsService;
import com.hjuk.devcodehub.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

  private final AdminStatsService adminStatsService;

  @GetMapping
  public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats(
      @RequestParam(defaultValue = "7") int days) {
    return ResponseEntity.ok(ApiResponse.success(adminStatsService.getStats(days)));
  }
}
