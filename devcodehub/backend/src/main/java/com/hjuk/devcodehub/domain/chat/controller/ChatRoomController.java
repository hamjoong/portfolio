package com.hjuk.devcodehub.domain.chat.controller;

import com.hjuk.devcodehub.domain.chat.dto.ChatMessageResponse;
import com.hjuk.devcodehub.domain.chat.dto.ChatRoomRequest;
import com.hjuk.devcodehub.domain.chat.dto.ChatRoomResponse;
import com.hjuk.devcodehub.domain.chat.service.ChatService;
import com.hjuk.devcodehub.global.common.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chats/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

  private static final int DEFAULT_PAGE_SIZE = 20;

  private final ChatService chatService;

  @PostMapping
  public ResponseEntity<ApiResponse<Long>> createRoom(
      @Valid @RequestBody ChatRoomRequest request, @AuthenticationPrincipal User user) {
    return ResponseEntity.ok(
        ApiResponse.success(chatService.createChatRoom(request, user.getUsername())));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<ChatRoomResponse>>> getRooms(
      @AuthenticationPrincipal User user) {
    return ResponseEntity.ok(ApiResponse.success(chatService.getMyChatRooms(user.getUsername())));
  }

  @GetMapping("/{roomId}/messages")
  public ResponseEntity<ApiResponse<Page<ChatMessageResponse>>> getMessages(
      @PathVariable Long roomId,
      @PageableDefault(
              size = DEFAULT_PAGE_SIZE,
              sort = "createdAt",
              direction = Sort.Direction.DESC)
          Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.success(chatService.getChatMessages(roomId, pageable)));
  }

  @PatchMapping("/{roomId}/read")
  public ResponseEntity<ApiResponse<Void>> markAsRead(
      @PathVariable Long roomId,
      @RequestBody java.util.Map<String, Long> request,
      @AuthenticationPrincipal User user) {
    chatService.updateLastRead(roomId, user.getUsername(), request.get("messageId"));
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @DeleteMapping("/{roomId}/leave")
  public ResponseEntity<ApiResponse<Void>> leaveRoom(
      @PathVariable Long roomId, @AuthenticationPrincipal User user) {
    chatService.leaveChatRoom(roomId, user.getUsername());
    return ResponseEntity.ok(ApiResponse.success(null));
  }
}
