
#FROM bellsoft/liberica-openjdk-alpine-musl:17
FROM openjdk:17-alpine
ARG JAR_FILE=target/*.jar
COPY target/demo-0.0.1.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
#docker buildx build --platform linux/amd64 --no-cache -t springbootdemo .

#docker run -d -p 80:8080 username/my-spring-boot-app:latest