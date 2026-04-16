package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/nexhire/engine/internal/matcher"
	"github.com/nexhire/engine/internal/models"
	"go.uber.org/zap"
)

func NewServer(engine *matcher.SmartMatchEngine, logger *zap.SugaredLogger) *fiber.App {
	app := fiber.New(fiber.Config{AppName: "NexHire Engine v2.0", ServerHeader: "NexHire-Engine"})

	app.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "engine", "version": "2.0.0"})
	})

	app.Post("/api/match", func(c fiber.Ctx) error {
		var req models.MatchRequest
		if err := c.Bind().JSON(&req); err != nil { return c.Status(400).JSON(fiber.Map{"error": "Invalid request"}) }
		if req.TenantID == "" || req.DriveID == "" { return c.Status(400).JSON(fiber.Map{"error": "tenantId and driveId required"}) }
		result, err := engine.MatchStudents(req)
		if err != nil { logger.Errorw("Match failed", "error", err); return c.Status(500).JSON(fiber.Map{"error": "Match failed"}) }
		return c.JSON(result)
	})

	app.Post("/api/reports", func(c fiber.Ctx) error {
		var req models.ReportRequest
		if err := c.Bind().JSON(&req); err != nil { return c.Status(400).JSON(fiber.Map{"error": "Invalid request"}) }
		return c.JSON(models.ReportResponse{URL: "/reports/" + req.DriveID + ".pdf", Filename: req.Type + "_" + req.DriveID + ".pdf", SizeBytes: 0})
	})

	app.Post("/api/bulk/students", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "Bulk processing initiated", "status": "queued"})
	})

	return app
}
