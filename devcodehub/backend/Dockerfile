# 1. 빌드 단계
FROM docker.io/library/maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# 2. 실행 단계
FROM docker.io/library/eclipse-temurin:21-jre-jammy
WORKDIR /app

# 빌드 단계에서 생성된 jar 파일 복사 (파일명은 pom.xml의 artifactId와 version에 따라 다를 수 있음)
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]