package com.hjuk.devcodehub.domain.user.service;

import com.hjuk.devcodehub.global.error.exception.BusinessException;
import com.hjuk.devcodehub.global.error.exception.ErrorCode;
import java.io.IOException;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

/**
 * [Why] 업로드 파일의 확장자·타입을 클라이언트가 보낸 값 그대로 믿으면 HTML·스크립트가 공개 URL로 서빙될 수 있다. 허용 이미지 형식만
 * 받고, 파일 앞부분(매직 바이트)까지 확인한 뒤 서버가 확장자를 직접 정한다.
 */
final class ImageUploadValidator {

  private static final long MAX_BYTES = 5L * 1024 * 1024;
  private static final Map<String, String> EXTENSION_BY_TYPE =
      Map.of(
          "image/jpeg", ".jpg",
          "image/png", ".png",
          "image/webp", ".webp",
          "image/gif", ".gif");

  private ImageUploadValidator() {
    // 유틸리티 클래스
  }

  /** @return 서버가 정한 안전한 확장자(점 포함). 허용되지 않으면 예외 */
  static String validateAndGetExtension(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new BusinessException("업로드할 파일이 없습니다.", ErrorCode.INVALID_INPUT_VALUE);
    }
    if (file.getSize() > MAX_BYTES) {
      throw new BusinessException("이미지는 5MB 이하만 업로드할 수 있습니다.", ErrorCode.INVALID_INPUT_VALUE);
    }
    String extension = EXTENSION_BY_TYPE.get(file.getContentType());
    if (extension == null) {
      throw new BusinessException(
          "jpg, png, webp, gif 이미지만 업로드할 수 있습니다.", ErrorCode.INVALID_INPUT_VALUE);
    }
    if (!matchesSignature(file, extension)) {
      throw new BusinessException("이미지 파일 형식이 올바르지 않습니다.", ErrorCode.INVALID_INPUT_VALUE);
    }
    return extension;
  }

  private static boolean matchesSignature(MultipartFile file, String extension) {
    byte[] head = new byte[12];
    try (var in = file.getInputStream()) {
      int read = in.readNBytes(head, 0, head.length);
      if (read < head.length) {
        return false;
      }
    } catch (IOException e) {
      return false;
    }
    return switch (extension) {
      case ".jpg" -> (head[0] & 0xFF) == 0xFF && (head[1] & 0xFF) == 0xD8;
      case ".png" -> (head[0] & 0xFF) == 0x89 && head[1] == 'P' && head[2] == 'N' && head[3] == 'G';
      case ".gif" -> head[0] == 'G' && head[1] == 'I' && head[2] == 'F';
      case ".webp" -> head[0] == 'R' && head[1] == 'I' && head[2] == 'F' && head[3] == 'F'
          && head[8] == 'W' && head[9] == 'E' && head[10] == 'B' && head[11] == 'P';
      default -> false;
    };
  }
}
