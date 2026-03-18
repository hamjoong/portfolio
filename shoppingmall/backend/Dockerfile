# 1. Build stage (최적화 버전 - 캐시 활용 강화)
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Maven 래퍼와 설정 파일 먼저 복사 (캐시 활용)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw

# 의존성 다운로드 및 오프라인 모드 준비 (캐시 강화 + 플러그인 포함)
RUN ./mvnw dependency:go-offline dependency:resolve-plugins -B -ntp -q

# 소스 코드 복사 및 빌드 (테스트 건너뛰기, 병렬 빌드, quiet 모드)
# Note: --offline 사용 불가 - go-offline이 전이적 의존성을 100% 캐시하지 못함
COPY src src
RUN ./mvnw clean package -DskipTests -B -ntp -q -T 1C

# 2. Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# JVM 최적화: 512MB 환경에서 OS 메모리 확보와 실행 안정성을 위한 지능형 설정 (Phase 5)
# [Phase 5] MaxRAMPercentage를 사용하여 유동적으로 메모리 관리
ENTRYPOINT ["java", \
  "-XX:MaxRAMPercentage=70.0", \
  "-XX:InitialRAMPercentage=40.0", \
  "-XX:+UseSerialGC", \
  "-XX:TieredStopAtLevel=1", \
  "-XX:MaxMetaspaceSize=96m", \
  "-XX:ReservedCodeCacheSize=32m", \
  "-Xss256k", \
  "-XX:+UseCompressedOops", \
  "-XX:+UseCompressedClassPointers", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=prod", \
  "-jar", "app.jar"]
