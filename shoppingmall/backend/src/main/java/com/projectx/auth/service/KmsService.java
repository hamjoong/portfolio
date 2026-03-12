package com.projectx.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.kms.KmsClient;
import software.amazon.awssdk.services.kms.model.DecryptRequest;
import software.amazon.awssdk.services.kms.model.EncryptRequest;

import java.util.Base64;
import java.util.Map;

/**
 * AWS KMS를 활용한 데이터 암호화/복호화 서비스입니다.
 * [리팩토링] 객체(Map) 단위의 암호화 지원 기능을 추가하여 서비스 레이어의 JSON 처리 부담을 제거했습니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KmsService {

    private final KmsClient kmsClient;
    private final ObjectMapper objectMapper;

    @Value("${aws.kms.key-id}")
    private String kmsKeyId;

    /**
     * 평문 문자열을 암호화합니다.
     */
    public String encrypt(String plainText) {
        try {
            EncryptRequest request = EncryptRequest.builder()
                    .keyId(kmsKeyId)
                    .plaintext(SdkBytes.fromUtf8String(plainText))
                    .build();

            byte[] cipherBytes = kmsClient.encrypt(request).ciphertextBlob().asByteArray();
            return Base64.getEncoder().encodeToString(cipherBytes);
        } catch (Exception e) {
            log.warn("[KMS] Encryption failed (Mocking/Offline mode): {}. Returning raw text for development.", e.getMessage());
            // [수정] Mock 상황에서는 Base64 인코딩 없이 원본을 돌려주어 JSON 형식을 유지함
            return plainText;
        }
    }

    /**
     * 암호문을 복호화하여 평문으로 반환합니다.
     */
    public String decrypt(String cipherText) {
        try {
            DecryptRequest request = DecryptRequest.builder()
                    .ciphertextBlob(SdkBytes.fromByteArray(Base64.getDecoder().decode(cipherText)))
                    .build();

            return kmsClient.decrypt(request).plaintext().asUtf8String();
        } catch (Exception e) {
            log.warn("[KMS] Decryption failed (Mocking/Offline mode): {}. Returning cipherText as raw.", e.getMessage());
            // [수정] 인코딩되지 않은 평문이 들어왔을 경우 그대로 반환
            return cipherText;
        }
    }

    /**
     * 맵 객체를 JSON으로 변환 후 암호화합니다.
     * [이유] 프로필 정보 등 다중 필드 데이터를 한 번에 안전하게 처리하기 위함입니다.
     */
    public String encryptMap(Map<String, Object> data) {
        try {
            String json = objectMapper.writeValueAsString(data);
            return encrypt(json);
        } catch (Exception e) {
            log.error("[KMS] Serialization failed for encryption", e);
            throw new RuntimeException("데이터 암호화 중 오류가 발생했습니다.");
        }
    }

    /**
     * 암호문을 복호화하여 다시 맵 객체로 반환합니다.
     */
    public Map<String, Object> decryptToMap(String cipherText) {
        try {
            String json = decrypt(cipherText);
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            log.error("[KMS] Deserialization failed for decryption", e);
            throw new RuntimeException("데이터 복호화 중 오류가 발생했습니다.");
        }
    }
}
