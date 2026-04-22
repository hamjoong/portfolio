package com.hjuk.devcodehub.domain.board.repository;

import com.hjuk.devcodehub.domain.board.domain.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
  @EntityGraph(attributePaths = {"author"})
  List<Comment> findByBoardIdOrderByCreatedAtAsc(Long boardId);
}
