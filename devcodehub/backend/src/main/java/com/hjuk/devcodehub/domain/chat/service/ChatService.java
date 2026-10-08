package com.hjuk.devcodehub.domain.chat.service;

import com.hjuk.devcodehub.domain.chat.domain.ChatMessage;
import com.hjuk.devcodehub.domain.chat.domain.ChatMessageType;
import com.hjuk.devcodehub.domain.chat.domain.ChatRoom;
import com.hjuk.devcodehub.domain.chat.domain.ChatRoomUser;
import com.hjuk.devcodehub.domain.chat.dto.ChatMessageRequest;
import com.hjuk.devcodehub.domain.chat.dto.ChatMessageResponse;
import com.hjuk.devcodehub.domain.chat.dto.ChatRoomRequest;
import com.hjuk.devcodehub.domain.chat.dto.ChatRoomResponse;
import com.hjuk.devcodehub.domain.chat.repository.ChatMessageRepository;
import com.hjuk.devcodehub.domain.chat.repository.ChatRoomRepository;
import com.hjuk.devcodehub.domain.chat.repository.ChatRoomUserRepository;
import com.hjuk.devcodehub.domain.user.domain.User;
import com.hjuk.devcodehub.domain.user.repository.UserRepository;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ChatService {

  private final ChatRoomRepository chatRoomRepository;
  private final ChatRoomUserRepository chatRoomUserRepository;
  private final ChatMessageRepository chatMessageRepository;
  private final UserRepository userRepository;
  private final org.springframework.context.ApplicationEventPublisher eventPublisher;

  private static final int MAX_MESSAGE_LENGTH = 2000;

  private final String instanceId = java.util.UUID.randomUUID().toString();

  public String getInstanceId() {
    return instanceId;
  }

  /**
   * [Why] 채팅방을 생성합니다.
   *
   * @param request 채팅방 생성 요청
   * @param loginId 신청자 로그인 ID
   * @return 생성된 채팅방 ID
   */
  public Long createChatRoom(ChatRoomRequest request, String loginId) {
    User creator =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    ChatRoom chatRoom = ChatRoom.builder().name(request.getName()).type(request.getType()).build();
    chatRoomRepository.save(chatRoom);

    // 생성자 추가
    chatRoomUserRepository.save(new ChatRoomUser(chatRoom, creator));

    // 다른 참여자들 추가 및 알림 발송
    if (request.getParticipantLoginIds() != null && !request.getParticipantLoginIds().isEmpty()) {
      java.util.List<String> targetIds = new java.util.ArrayList<>();

      for (String pid : request.getParticipantLoginIds()) {
        if (pid == null || pid.equals(creator.getLoginId())) {
          continue;
        }

        userRepository
            .findByLoginId(pid)
            .ifPresent(
                u -> {
                  chatRoomUserRepository.save(new ChatRoomUser(chatRoom, u));
                  targetIds.add(u.getLoginId());
                });
      }

      // [신규] 모든 참여자를 포함한 채팅 초대 이벤트 단일 발행
      if (!targetIds.isEmpty()) {
        eventPublisher.publishEvent(
            new com.hjuk.devcodehub.domain.notification.event.ChatInvitationEvent(
                targetIds, creator.getNickname()));
      }
    }

    return chatRoom.getId();
  }

  /**
   * [Why] 사용자가 속한 채팅방 목록을 조회합니다.
   *
   * @param loginId 로그인 ID
   * @return 채팅방 응답 목록
   */
  @Transactional(readOnly = true)
  public List<ChatRoomResponse> getMyChatRooms(String loginId) {
    User user = findUserByLoginId(loginId);
    List<ChatRoomUser> userRooms = chatRoomUserRepository.findByUser(user);

    if (userRooms.isEmpty()) {
      return List.of();
    }

    List<Long> roomIds = userRooms.stream()
        .map(cru -> cru.getChatRoom().getId())
        .toList();

    Map<Long, ChatMessage> latestMessages = fetchLatestMessages(roomIds);
    Map<Long, Long> unreadCounts = fetchUnreadCounts(user.getId());

    return userRooms.stream()
        .map(cru -> convertToChatRoomResponse(cru.getChatRoom(), latestMessages, unreadCounts))
        .collect(Collectors.toList());
  }

  private User findUserByLoginId(String loginId) {
    return userRepository.findByLoginId(loginId)
        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
  }

  private Map<Long, ChatMessage> fetchLatestMessages(List<Long> roomIds) {
    return chatMessageRepository.findLatestMessagesByRoomIds(roomIds).stream()
        .collect(Collectors.toMap(cm -> cm.getChatRoom().getId(), cm -> cm));
  }

  private Map<Long, Long> fetchUnreadCounts(Long userId) {
    return chatMessageRepository.countUnreadMessagesByUserId(userId).stream()
        .collect(Collectors.toMap(row -> (Long) row[0], row -> (Long) row[1]));
  }

  private ChatRoomResponse convertToChatRoomResponse(
      ChatRoom room,
      Map<Long, ChatMessage> latestMessages,
      Map<Long, Long> unreadCounts) {

    ChatMessage lastMsg = latestMessages.get(room.getId());
    long unreadCount = unreadCounts.getOrDefault(room.getId(), 0L);

    return new ChatRoomResponse(
        room,
        lastMsg != null ? lastMsg.getMessage() : "대화 내용이 없습니다.",
        lastMsg != null ? lastMsg.getCreatedAt() : room.getCreatedAt(),
        unreadCount);
  }

  /**
   * [Why] 특정 채팅방의 메시지 내역을 조회합니다.
   *
   * @param roomId   채팅방 ID
   * @param loginId  요청자 로그인 ID (참여자만 조회 가능)
   * @param pageable 페이징 정보
   * @return 메시지 목록
   */
  @Transactional(readOnly = true)
  public org.springframework.data.domain.Page<ChatMessageResponse> getChatMessages(
      Long roomId, String loginId, org.springframework.data.domain.Pageable pageable) {
    ChatRoom room = chatRoomRepository.findById(roomId)
        .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
    requireMember(roomId, loginId);

    return chatMessageRepository.findByChatRoomOrderByCreatedAtDesc(room, pageable)
        .map(ChatMessageResponse::new);
  }

  /**
   * [Why] 메시지를 저장하고 관련 이벤트를 발행합니다. 발신자는 클라이언트가 보낸 값이 아니라 인증된 사용자로 정한다.
   *
   * @param request 메시지 요청
   * @param senderLoginId 인증된 발신자 로그인 ID
   * @return 메시지 응답
   */
  @Transactional
  public ChatMessageResponse saveMessage(ChatMessageRequest request, String senderLoginId) {
    if (request.getMessage() == null
        || request.getMessage().isBlank()
        || request.getMessage().length() > MAX_MESSAGE_LENGTH) {
      throw new BusinessException(
          "메시지는 1~" + MAX_MESSAGE_LENGTH + "자여야 합니다.", ErrorCode.INVALID_INPUT_VALUE);
    }
    ChatRoom room = chatRoomRepository.findById(request.getRoomId())
        .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
    User sender = findUserByLoginId(senderLoginId);
    requireMember(room.getId(), senderLoginId);

    ChatMessage savedMessage = chatMessageRepository.save(createChatMessage(room, sender, request));
    updateLastReadForSender(room, sender, savedMessage.getId());

    ChatMessageResponse response = new ChatMessageResponse(savedMessage);
    publishChatEvents(room, response);

    return response;
  }

  private void requireMember(Long roomId, String loginId) {
    if (!chatRoomUserRepository.existsByChatRoomIdAndUserLoginId(roomId, loginId)) {
      throw new BusinessException(ErrorCode.HANDLE_ACCESS_DENIED);
    }
  }

  private ChatMessage createChatMessage(ChatRoom room, User sender, ChatMessageRequest request) {
    return ChatMessage.builder()
        .chatRoom(room)
        .sender(sender)
        .message(request.getMessage())
        .type(request.getType() != null ? request.getType() : ChatMessageType.TALK)
        .build();
  }

  private void updateLastReadForSender(ChatRoom room, User sender, Long messageId) {
    chatRoomUserRepository.findByChatRoomAndUser(room, sender)
        .ifPresent(cru -> cru.updateLastReadMessageId(messageId));
  }

  private void publishChatEvents(ChatRoom room, ChatMessageResponse response) {
    List<String> participantLoginIds = chatRoomUserRepository.findByChatRoomId(room.getId())
        .stream()
        .map(cru -> cru.getUser().getLoginId())
        .toList();

    eventPublisher.publishEvent(
        new com.hjuk.devcodehub.domain.notification.event.ChatMessageSentEvent(response, participantLoginIds));
  }

  /**
   * [Why] 사용자가 채팅방을 나갑니다.
   *
   * @param roomId  채팅방 ID
   * @param loginId 로그인 ID
   */
  public void leaveChatRoom(Long roomId, String loginId) {
    ChatRoom room =
        chatRoomRepository
            .findById(roomId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
    User user =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    chatRoomUserRepository
        .findByChatRoomAndUser(room, user)
        .ifPresent(chatRoomUserRepository::delete);
  }

  /**
   * [Why] 마지막 읽은 시간 및 메시지 ID 업데이트.
   *
   * @param roomId    채팅방 ID
   * @param loginId   로그인 ID
   * @param messageId 읽은 메시지 ID
   */
  @Transactional
  public void updateLastRead(Long roomId, String loginId, Long messageId) {
    ChatRoom room =
        chatRoomRepository
            .findById(roomId)
            .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));
    User user =
        userRepository
            .findByLoginId(loginId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

    chatRoomUserRepository
        .findByChatRoomAndUser(room, user)
        .ifPresent(cru -> {
            cru.updateLastReadAt();
            cru.updateLastReadMessageId(messageId);
        });
  }
}
