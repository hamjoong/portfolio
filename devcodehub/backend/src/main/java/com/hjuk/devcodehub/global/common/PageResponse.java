package com.hjuk.devcodehub.global.common;

import java.util.List;
import lombok.Getter;
import org.springframework.data.domain.Page;

/**
 * 페이지 목록 응답 객체. [Why] {@code PageImpl}을 그대로 JSON으로 내보내면 Spring Data가 구조 불안정 경고를 남기므로, 프론트가 쓰는 평평한
 * 필드(content, totalPages 등)만 담은 고정 형태로 바꿔 내보냅니다. JSON 모양은 기존과 같습니다.
 *
 * @param <T> 목록 요소 타입
 */
@Getter
public final class PageResponse<T> {

  private final List<T> content;
  private final long totalElements;
  private final int totalPages;
  private final int number;
  private final int size;
  private final int numberOfElements;
  private final boolean first;
  private final boolean last;
  private final boolean empty;

  private PageResponse(Page<T> page) {
    this.content = page.getContent();
    this.totalElements = page.getTotalElements();
    this.totalPages = page.getTotalPages();
    this.number = page.getNumber();
    this.size = page.getSize();
    this.numberOfElements = page.getNumberOfElements();
    this.first = page.isFirst();
    this.last = page.isLast();
    this.empty = page.isEmpty();
  }

  /**
   * [Why] Spring Data의 Page를 응답용 객체로 변환합니다.
   *
   * @param <T> 목록 요소 타입
   * @param page 변환할 페이지
   * @return 응답용 페이지 객체
   */
  public static <T> PageResponse<T> of(Page<T> page) {
    return new PageResponse<>(page);
  }
}
