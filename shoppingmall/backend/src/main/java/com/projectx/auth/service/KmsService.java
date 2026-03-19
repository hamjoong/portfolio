package com.projectx.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectx.auth.exception.BusinessException;
import com.projectx.auth.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.kms.KmsClient;
import software.amazon.awssdk.services.kms.model.DecryptRequest;
import software.amazon.awssdk.services.kms.model.EncryptRequest;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * AWS KMS와 로컬 AES 암호화를 병행 지원하는 하이브리드 보안 서비스입니다.
 * [보안 강화] AWS KMS 호출 실패 시에도 평문 저장을 방지하기 위해 로컬 AES 암호화로 즉시 전환합니다.
 * [호환성] 접두사(KMS:, LOCAL:)를 통해 암호화 방식을 구분하여 복호화를 수행합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KmsService {

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private KmsClient kmsClient;
    private final ObjectMapper objectMapper;

    @Value("${aws.kms.key-id:dummy}")
    private String kmsKeyId;

    // 로컬 암호화용 고정 키 (AES-256을 위한 32바이트 키)
    private static final String LOCAL_KEY = "project-x-mall-security-key-2026"; 

    /**
     * 데이터를 암호화합니다. (KMS 우선, 실패 시 로컬 AES)
     */
    public String encrypt(String plainText) {
        if (plainText == null) return null;
        
        try {
            // KMS 설정 및 클라이언트가 유효한 경우에만 시도
            if (kmsClient != null && kmsKeyId != null && !kmsKeyId.contains("dummy")) {
                EncryptRequest request = EncryptRequest.builder()
                        .keyId(kmsKeyId)
                        .plaintext(SdkBytes.fromUtf8String(plainText))
                        .build();

                byte[] cipherBytes = kmsClient.encrypt(request).ciphertextBlob().asByteArray();
                return "KMS:" + Base64.getEncoder().encodeToString(cipherBytes);
            }
            throw new RuntimeException("KMS key or client not configured properly");
        } catch (Exception e) {
            log.warn("[KMS] Encryption failed or skipped. Falling back to local AES encryption: {}", e.getMessage());
            try {
                return "LOCAL:" + aesEncrypt(plainText);
            } catch (Exception ex) {
                log.error("[KMS] Local encryption failed critically", ex);
                throw new BusinessException(ErrorCode.ENCRYPTION_FAILED);
            }
        }
    }

    /**
     * 데이터를 복호화합니다. (접두사에 따라 방식 자동 선택)
     */
    public String decrypt(String cipherText) {
        if (cipherText == null) return null;

        try {
            if (cipherText.startsWith("KMS:") && kmsClient != null) {
                byte[] decoded = Base64.getDecoder().decode(cipherText.substring(4));
                DecryptRequest request = DecryptRequest.builder()
                        .ciphertextBlob(SdkBytes.fromByteArray(decoded))
                        .build();
                return kmsClient.decrypt(request).plaintext().asUtf8String();
            } else if (cipherText.startsWith("LOCAL:")) {
                return aesDecrypt(cipherText.substring(6));
            }
            
            log.warn("[KMS] Provided text has no valid prefix. Returning as-is.");
            return cipherText;
        } catch (Exception e) {
            log.error("[KMS] Decryption failed critically for: {}", cipherText, e);
            return cipherText;
        }
    }

    private String aesEncrypt(String data) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(LOCAL_KEY.getBytes(StandardCharsets.UTF_8), "AES");
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encrypted);
    }

    private String aesDecrypt(String encryptedData) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(LOCAL_KEY.getBytes(StandardCharsets.UTF_8), "AES");
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
        return new String(decrypted, StandardCharsets.UTF_8);
    }

    /**
     * 맵 객체를 암호화된 문자열로 변환합니다.
     */
    public String encryptMap(Map<String, Object> data) {
        try {
            String json = objectMapper.writeValueAsString(data);
            return encrypt(json);
        } catch (Exception e) {
            log.error("[KMS] Serialization failed", e);
            throw new BusinessException(ErrorCode.ENCRYPTION_FAILED);
        }
    }

    /**
     * 암호화된 문자열을 다시 맵 객체로 복호화합니다.
     */
    public Map<String, Object> decryptToMap(String cipherText) {
        try {
            String json = decrypt(cipherText);
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            log.error("[KMS] Deserialization failed for: {}", cipherText, e);
            throw new BusinessException(ErrorCode.ENCRYPTION_FAILED);
        }
    }
}
