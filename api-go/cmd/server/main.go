package main

import (
	"log"
	"os"
	"strconv"
	"time"
        "errors"
	"github.com/gofiber/fiber/v2"
	"interseguro/api-go/internal/handlers"
	"interseguro/api-go/internal/services"
)

func main() {
	port := env("PORT", "8080")
	nodeURL := env("NODE_API_URL", "http://localhost:3001/api/v1/statistics")
	timeoutSeconds, err := strconv.Atoi(env("HTTP_TIMEOUT_SECONDS", "5"))
	if err != nil || timeoutSeconds <= 0 {
		timeoutSeconds = 5
	}

	statisticsClient := services.NewStatisticsClient(nodeURL, time.Duration(timeoutSeconds)*time.Second)
	app := fiber.New(fiber.Config{
		BodyLimit: 1 * 1024 * 1024,
		AppName:   "Interseguro QR API",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			var fiberErr *fiber.Error
			if errors.As(err, &fiberErr) {
				code = fiberErr.Code
			}
			return c.Status(code).JSON(fiber.Map{"error": err.Error()})
		},
	})
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "api-go"})
	})
	app.Post("/api/v1/qr", handlers.NewQRHandler(statisticsClient).Handle)

	log.Printf("Go API listening on :%s", port)
	log.Fatal(app.Listen(":" + port))
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
