# 1. Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN chmod +x mvnw
# Maven 빌드 수행 (테스트 제외하여 속도 향상)
RUN ./mvnw clean package -DskipTests

# 2. Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# 빌드된 jar 파일만 복사하여 이미지 크기 최소화
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
