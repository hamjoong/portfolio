package com.projectx.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

/**
 * AWS S3 연동을 담당하는 서비스입니다.
 * [이유] 대용량 이미지 데이터를 서버 메모리에 담지 않고 S3로 직접 업로드하도록 
 * Presigned URL을 제공하여 서버의 부하를 최소화하고 보안을 강화하기 위함입니다.
 */
@Slf4j
@Service
public class S3Service {

    private final S3Presigner s3Presigner;
    private final String bucketName;

    public S3Service(S3Presigner s3Presigner, @Value("${aws.s3.bucket}") String bucketName) {
        this.s3Presigner = s3Presigner;
        this.bucketName = bucketName;
    }

    /**
     * 프론트엔드 업로드를 위한 Presigned URL을 생성합니다.
     * [이유] 서버의 액세스 키를 클라이언트에 노출하지 않고, 
     * 특정 시간 동안만 유효한 업로드 권한을 부여하여 보안을 유지하기 위함입니다.
     */
    public String getPresignedUrl(String fileName) {
        // 1. 유니크한 파일 이름 생성 (raw/ 경로 사용)
        String key = "raw/" + UUID.randomUUID().toString() + "_" + fileName;

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType("image/jpeg") // 확장자에 따른 동적 처리 가능
                .build();

        // 2. 10분 동안 유효한 Presigned URL 생성
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        
        log.info("[S3] Presigned URL generated for key: {}", key);
        return presignedRequest.url().toString();
    }
}
