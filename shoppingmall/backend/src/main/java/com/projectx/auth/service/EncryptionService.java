package com.projectx.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectx.auth.exception.BusinessException;
import com.projectx.auth.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * 로컬 AES 암호화를 사용하여 데이터를 안전하게 처리하는 서비스입니다.
 * [통합] 환경 간 일관성을 위해 KMS 의존성을 제거하고 로컬 암호화로 통합하였습니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EncryptionService {

    private final ObjectMapper objectMapper;

    @Value("${encryption.key}")
    private String localKey;

    /**
     * 데이터를 로컬 AES 방식으로 암호화합니다.
     */
    public String encrypt(String plainText) {
        if (plainText == null) return null;
        try {
            return aesEncrypt(plainText);
        } catch (Exception e) {
            log.error("[Encryption] Local encryption failed", e);
            throw new BusinessException(ErrorCode.ENCRYPTION_FAILED, e);
        }
    }

    /**
     * 데이터를 로컬 AES 방식으로 복호화합니다.
     */
    public String decrypt(String cipherText) {
        if (cipherText == null) return null;
        try {
            // [수정] 접두사 제거 로직 추가
            if (cipherText.startsWith("LOCAL:")) {
                return aesDecrypt(cipherText.substring(6));
            }
            return aesDecrypt(cipherText); // 접두사가 없는 경우도 고려
        } catch (Exception e) {
            log.error("[Encryption] Local decryption failed", e);
            throw new BusinessException(ErrorCode.ENCRYPTION_FAILED, e);
        }
    }

    private String aesEncrypt(String data) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(localKey.getBytes(StandardCharsets.UTF_8), "AES");
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encrypted);
    }

    private String aesDecrypt(String encryptedData) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(localKey.getBytes(StandardCharsets.UTF_8), "AES");
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
            log.error("[Encryption] Serialization failed", e);
            throw new BusinessException(ErrorCode.ENCRYPTION_FAILED, e);
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
            log.error("[Encryption] Deserialization failed", e);
            throw new BusinessException(ErrorCode.ENCRYPTION_FAILED, e);
        }
    }
}
