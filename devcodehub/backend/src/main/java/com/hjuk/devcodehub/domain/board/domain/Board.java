package com.hjuk.devcodehub.domain.board.domain;

import com.hjuk.devcodehub.domain.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "boards",
    indexes = {
      @Index(name = "idx_board_type_created_at", columnList = "type, created_at"),
      @Index(name = "idx_board_title", columnList = "title"),
      @Index(name = "idx_board_content", columnList = "content"),
      @Index(name = "idx_boards_fts", columnList = "title, content")
    })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Board {

  private static final int DEFAULT_BATCH_SIZE = 50;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String content;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private BoardType type;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User author;

  @org.hibernate.annotations.BatchSize(size = DEFAULT_BATCH_SIZE)
  @ElementCollection
  @CollectionTable(name = "board_tags", joinColumns = @JoinColumn(name = "board_id"))
  @Column(name = "tag")
  private List<String> tags = new ArrayList<>();

  @Column(name = "view_count", columnDefinition = "integer default 0")
  private int viewCount;

  @org.hibernate.annotations.BatchSize(size = DEFAULT_BATCH_SIZE)
  @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Comment> comments = new ArrayList<>();

  @org.hibernate.annotations.BatchSize(size = DEFAULT_BATCH_SIZE)
  @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<BoardLike> likes = new ArrayList<>();

  @org.hibernate.annotations.BatchSize(size = DEFAULT_BATCH_SIZE)
  @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<BoardBookmark> bookmarks = new ArrayList<>();

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Builder
  @SuppressWarnings("checkstyle:HiddenField")
  public Board(String title, String content, BoardType type, User author, List<String> tags) {
    this.title = title;
    this.content = content;
    this.type = type;
    this.author = author;
    this.tags = tags != null ? tags : new ArrayList<>();
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  /**
   * 게시글 내용을 수정합니다.
   *
   * @param inputTitle   수정할 제목
   * @param inputContent 수정할 내용
   * @param inputTags    수정할 태그 목록
   */
  public void update(String inputTitle, String inputContent, List<String> inputTags) {
    this.title = inputTitle;
    this.content = inputContent;
    this.tags = inputTags;
    this.updatedAt = LocalDateTime.now();
  }

  public void incrementViewCount() {
    this.viewCount++;
  }
}
