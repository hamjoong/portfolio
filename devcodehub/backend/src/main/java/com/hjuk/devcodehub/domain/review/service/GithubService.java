package com.hjuk.devcodehub.domain.review.service;

import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class GithubService {

  private final UserRepository userRepository;
  private final RestClient.Builder restClientBuilder;

  /**
   * [Why] GitHub API를 호출하여 연동된 계정의 공개/개인 레포지토리 목록을 가져옵니다.
   *
   * @param loginId 로그인 ID
   * @return 레포지토리 목록
   */
  public List<Map<String, Object>> getUserRepos(String loginId) {
    User user =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    String token = user.getSocialAccessToken();
    if (token == null || !user.getProvider().equals("github")) {
      throw new BusinessException("GitHub 계정 연동이 필요합니다.", ErrorCode.HANDLE_ACCESS_DENIED);
    }

    try {
      return restClientBuilder
          .build()
          .get()
          .uri("https://api.github.com/user/repos?sort=updated&per_page=100")
          .header("Authorization", "Bearer " + token)
          .header("Accept", "application/vnd.github.v3+json")
          .retrieve()
          .body(new ParameterizedTypeReference<List<Map<String, Object>>>() { });
    } catch (Exception e) {
      log.error("Failed to fetch GitHub repos: {}", e.getMessage());
      throw new BusinessException("GitHub API 호출 중 오류가 발생했습니다.", ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }
}
