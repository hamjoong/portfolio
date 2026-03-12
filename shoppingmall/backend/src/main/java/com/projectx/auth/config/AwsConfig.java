package com.projectx.auth.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.kms.KmsClient;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/**
 * AWS SDK 클라이언트 설정 클래스입니다.
 */
@Slf4j
@Configuration
@Profile({"dev", "prod"})
@RequiredArgsConstructor
public class AwsConfig {

    @Value("${aws.region:ap-northeast-2}")
    private String region;

    /**
     * KMS 클라이언트를 생성합니다.
     */
    @Bean
    public KmsClient kmsClient() {
        try {
            return KmsClient.builder()
                    .region(Region.of(region))
                    .build();
        } catch (Exception e) {
            log.warn("[AWS] Failed to create real KMS client, falling back to mock: {}", e.getMessage());
            return org.mockito.Mockito.mock(KmsClient.class);
        }
    }

    /**
     * S3 Presigner를 생성합니다.
     */
    @Bean
    public S3Presigner s3Presigner() {
        try {
            return S3Presigner.builder()
                    .region(Region.of(region))
                    .build();
        } catch (Exception e) {
            log.warn("[AWS] Failed to create real S3 Presigner, falling back to mock: {}", e.getMessage());
            return org.mockito.Mockito.mock(S3Presigner.class);
        }
    }
}
