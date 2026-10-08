package com.hjuk.devcodehub.domain.user.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.hjuk.devcodehub.global.error.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class ImageUploadValidatorTest {

  private static final byte[] PNG_HEAD = {
    (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0
  };

  @Test
  @DisplayName("PNG 파일은 서버가 정한 .png 확장자로 허용된다 (원본 이름은 무시)")
  void png_allowed() {
    MockMultipartFile file = new MockMultipartFile("file", "evil.html", "image/png", PNG_HEAD);

    assertEquals(".png", ImageUploadValidator.validateAndGetExtension(file));
  }

  @Test
  @DisplayName("이미지가 아닌 Content-Type은 거절된다")
  void nonImage_rejected() {
    MockMultipartFile file = new MockMultipartFile("file", "a.html", "text/html", "<script>".getBytes());

    assertThrows(BusinessException.class, () -> ImageUploadValidator.validateAndGetExtension(file));
  }

  @Test
  @DisplayName("Content-Type만 이미지로 속이고 내용이 이미지가 아니면 거절된다")
  void spoofedContentType_rejected() {
    MockMultipartFile file =
        new MockMultipartFile("file", "a.png", "image/png", "<html>not image</html>".getBytes());

    assertThrows(BusinessException.class, () -> ImageUploadValidator.validateAndGetExtension(file));
  }

  @Test
  @DisplayName("5MB를 넘는 파일은 거절된다")
  void tooLarge_rejected() {
    byte[] big = new byte[5 * 1024 * 1024 + 1];
    System.arraycopy(PNG_HEAD, 0, big, 0, PNG_HEAD.length);
    MockMultipartFile file = new MockMultipartFile("file", "big.png", "image/png", big);

    assertThrows(BusinessException.class, () -> ImageUploadValidator.validateAndGetExtension(file));
  }
}
