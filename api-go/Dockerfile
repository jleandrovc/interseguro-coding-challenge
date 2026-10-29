FROM golang:1.23-alpine AS build
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api-go ./cmd/server

FROM alpine:3.21
RUN adduser -D -H -u 10001 app
COPY --from=build /out/api-go /usr/local/bin/api-go
USER app
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/api-go"]
