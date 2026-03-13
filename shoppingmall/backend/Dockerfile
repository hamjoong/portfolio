# 1. Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Maven 래퍼와 pom.xml만 먼저 복사하여 종속성을 캐싱합니다.
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw

# 종속성만 미리 다운로드 (소스 코드 변경 시에도 캐시 활용 가능)
RUN ./mvnw dependency:go-offline -B

# 소스 코드 복사 및 빌드 (테스트 제외, 로그 간소화)
COPY src src
RUN ./mvnw clean package -DskipTests -B

# 2. Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# JVM 메모리 최적화: 무료 티어(512MB)에 맞게 최대 힙 크기를 제한합니다.
ENTRYPOINT ["java", "-Xmx384m", "-Xms256m", "-Djava.security.egd=file:/dev/./urandom", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
