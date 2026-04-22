package com.hjuk.devcodehub.domain.review.controller;

import com.hjuk.devcodehub.domain.review.service.GithubService;
import com.hjuk.devcodehub.global.common.ApiResponse;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/github")
@RequiredArgsConstructor
public class GithubController {

  private final GithubService githubService;

  @GetMapping("/repos")
  public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRepos(
      @AuthenticationPrincipal User user) {
    return ResponseEntity.ok(ApiResponse.success(githubService.getUserRepos(user.getUsername())));
  }
}
