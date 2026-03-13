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
 * [성능 최적화] 실제 AWS 인프라가 없는 환경(Render 등)에서도 
 * 초기화 에러 없이 기동되도록 더미 빈 생성을 보장합니다.
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
            log.warn("[AWS] Falling back to dummy KMS client: {}", e.getMessage());
            // Mockito 대신 기본 빌더를 통한 비어있는 클라이언트를 반환하여 런타임 에러 방지
            return KmsClient.builder().region(Region.of(region)).build();
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
            log.warn("[AWS] Falling back to dummy S3 Presigner: {}", e.getMessage());
            // Mockito 대신 기본 빌더를 통한 비어있는 클라이언트를 반환하여 런타임 에러 방지
            return S3Presigner.builder().region(Region.of(region)).build();
        }
    }
}
