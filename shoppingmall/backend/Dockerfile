# 1. Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Maven 래퍼와 설정 파일 먼저 복사 (캐시 활용)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw

# 의존성 다운로드 및 오프라인 모드 준비
RUN ./mvnw dependency:go-offline dependency:resolve-plugins -B -ntp -q

# 소스 코드 복사 및 빌드
COPY src src
RUN ./mvnw clean package -DskipTests -B -ntp -q -T 1C

# 2. Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# [중요] Render 환경에서는 프로세스가 포그라운드에서 떠 있어야 하므로 
# 백그라운드(&)나 nohup 실행을 제거한 포그라운드 실행 설정을 적용합니다.
ENTRYPOINT ["java", \
  "-XX:MaxRAMPercentage=70.0", \
  "-XX:InitialRAMPercentage=40.0", \
  "-XX:+UseSerialGC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=prod", \
  "-jar", "app.jar"]
