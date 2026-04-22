package com.hjuk.devcodehub.domain.user.controller;

import com.hjuk.devcodehub.domain.user.dto.UserResponse;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.global.common.ApiResponse;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rankings")
@RequiredArgsConstructor
public class RankingController {
  private final UserRepository userRepository;
  private static final int TOP_RANK_LIMIT = 5;

  @GetMapping
  public ResponseEntity<ApiResponse<List<UserResponse>>> getRankings() {
    List<UserResponse> rankedUsers =
        userRepository.findTopRankedUsers(PageRequest.of(0, TOP_RANK_LIMIT)).stream()
            .map(UserResponse::new)
            .collect(Collectors.toList());
    return ResponseEntity.ok(ApiResponse.success(rankedUsers));
  }
}
