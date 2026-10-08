package com.hjuk.devcodehub.global.logging;

import ch.qos.logback.classic.pattern.MessageConverter;
import ch.qos.logback.classic.spi.ILoggingEvent;
import java.util.regex.Pattern;

public class LogMaskingConverter extends MessageConverter {
  // 이메일 패턴(x@x.x)과 전화번호(010-0000-0000)를 찾아 마스킹
  private static final Pattern EMAIL_PATTERN = Pattern.compile("\\w+@\\w+\\.\\w+");
  private static final Pattern PHONE_PATTERN = Pattern.compile("\\d{3}-\\d{3,4}-\\d{4}");

  @Override
  public String convert(ILoggingEvent event) {
    String message = event.getFormattedMessage();
    String maskedEmail = EMAIL_PATTERN.matcher(message).replaceAll("****@****.****");
    return PHONE_PATTERN.matcher(maskedEmail).replaceAll("010-****-****");
  }
}
