FROM maven:3.9.16-eclipse-temurin-25 AS build
WORKDIR /app

# Build shared library
COPY sitad-common/pom.xml ./sitad-common/
COPY sitad-common/src ./sitad-common/src
RUN mvn -f sitad-common/pom.xml install -DskipTests

# Build service
COPY fiscalizacion/pom.xml ./fiscalizacion/
RUN mvn -f fiscalizacion/pom.xml dependency:go-offline
COPY fiscalizacion/src ./fiscalizacion/src
RUN mvn -f fiscalizacion/pom.xml package -DskipTests

FROM eclipse-temurin:25-jdk
WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/fiscalizacion/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
