package com.hjuk.devcodehub.domain.user.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.amazonaws.services.s3.AmazonS3;
import com.hjuk.devcodehub.global.error.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class S3FileStorageServiceTest {

  @Mock
  private AmazonS3 s3Client;

  @Mock
  private MultipartFile multipartFile;

  @Test
  @DisplayName("S3 클라이언트가 null인 경우 스토리지 구성 오류 예외가 발생해야 함")
  void uploadProfileImage_WhenClientIsNull_ThrowsException() {
    // given
    S3FileStorageService service = new S3FileStorageService(null);

    // when & then
    BusinessException exception = assertThrows(BusinessException.class, () -> {
      service.uploadProfileImage(multipartFile);
    });
    
    assertEquals("스토리지 서비스가 구성되지 않았습니다.", exception.getMessage());
  }

  @Test
  @DisplayName("정상적인 S3 업로드 시 파일 URL이 반환되어야 함")
  void uploadProfileImage_Success() throws Exception {
    // given
    S3FileStorageService service = new S3FileStorageService(s3Client);
    org.springframework.test.util.ReflectionTestUtils.setField(service, "bucketName", "test-bucket");
    
    when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
    when(multipartFile.getContentType()).thenReturn("image/jpeg");
    when(multipartFile.getSize()).thenReturn(100L);
    when(multipartFile.getInputStream()).thenReturn(new java.io.ByteArrayInputStream(new byte[100]));
    
    java.net.URL mockUrl = new java.net.URL("https://test-bucket.s3.amazonaws.com/profiles/random-uuid.jpg");
    when(s3Client.getUrl(anyString(), anyString())).thenReturn(mockUrl);

    // when
    String result = service.uploadProfileImage(multipartFile);

    // then
    assertNotNull(result);
    assertTrue(result.contains("profiles/"));
    verify(s3Client, times(1)).putObject(any());
  }
}
