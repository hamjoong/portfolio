package com.hjuk.devcodehub.domain.review.service.provider;

import java.util.Map;

/**
 * [Why] - Strategy Pattern 적용: OpenAI, Claude, Gemini 등 다양한 AI 서비스를 동일한 방식으로 호출하기 위함. - 결과 구조화: 모든
 * 제공자는 공통된 Map 형태의 구조화된 결과를 반환해야 함.
 */
public interface AiProvider {
  /**
   * AI 모델 이름 반환. (예: "openai", "claude", "gemini")
   *
   * @return 모델 이름
   */
  String getName();

  /**
   * 코드 리뷰를 수행합니다.
   *
   * @param code     리뷰할 코드
   * @param language 프로그래밍 언어 (null일 경우 AI가 자동 감지 시도)
   * @return 구조화된 리뷰 결과 (summary, rating, pros, cons 등 포함)
   */
  Map<String, Object> review(String code, String language);
}
