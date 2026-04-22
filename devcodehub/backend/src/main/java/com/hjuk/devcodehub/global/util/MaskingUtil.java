package com.hjuk.devcodehub.global.util;

/** [Why] SECURITY.md 지침에 따라 개인정보(PII)를 로그에 남길 때 마스킹 처리하기 위한 유틸리티입니다. */
public final class MaskingUtil {

  private static final int MIN_LENGTH_FOR_MASKING = 3;
  private static final int CONTACT_MIN_LENGTH = 8;
  private static final int ADDRESS_MIN_LENGTH = 5;

  private MaskingUtil() {
    throw new IllegalStateException("Utility class");
  }

  /**
   * [Why] 로그인 ID를 마스킹합니다. (예: user123 -> us*****)
   *
   * @param loginId 원본 로그인 ID
   * @return 마스킹된 ID
   */
  public static String maskLoginId(String loginId) {
    if (loginId == null || loginId.length() < MIN_LENGTH_FOR_MASKING) {
      return "***";
    }
    return loginId.substring(0, 2) + "*".repeat(loginId.length() - 2);
  }

  /**
   * [Why] 이메일을 마스킹합니다. (예: dev@example.com -> d**@example.com)
   *
   * @param email 원본 이메일
   * @return 마스킹된 이메일
   */
  public static String maskEmail(String email) {
    if (email == null || !email.contains("@")) {
      return "****";
    }
    String[] parts = email.split("@");
    if (parts[0].length() < 2) {
      return "*@" + parts[1];
    }
    return parts[0].substring(0, 1) + "**@" + parts[1];
  }

  /**
   * [Why] 연락처를 마스킹합니다. (예: 010-1234-5678 -> 010-****-5678)
   *
   * @param contact 원본 연락처
   * @return 마스킹된 연락처
   */
  public static String maskContact(String contact) {
    if (contact == null || contact.length() < CONTACT_MIN_LENGTH) {
      return "****";
    }
    return contact.replaceAll("(\\d{3})-(\\d{3,4})-(\\d{4})", "$1-****-$3");
  }

  /**
   * [Why] 주소를 마스킹합니다.
   *
   * @param address 원본 주소
   * @return 마스킹된 주소
   */
  public static String maskAddress(String address) {
    if (address == null || address.length() < ADDRESS_MIN_LENGTH) {
      return "****";
    }
    return address.substring(0, ADDRESS_MIN_LENGTH) + " ".repeat(address.length() - ADDRESS_MIN_LENGTH);
  }
}
