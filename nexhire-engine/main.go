package main

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/nexhire/engine/internal/config"
	"github.com/nexhire/engine/internal/handler"
	"github.com/nexhire/engine/internal/matcher"
	"go.uber.org/zap"
)

func main() {
	_ = godotenv.Load()
	logger, _ := zap.NewProduction()
	if os.Getenv("ENV") == "development" {
		logger, _ = zap.NewDevelopment()
	}
	defer logger.Sync()
	sugar := logger.Sugar()
	sugar.Info("🚀 NexHire Engine starting...")

	db, err := config.InitDB()
	if err != nil {
		sugar.Fatal("Failed to connect to database", zap.Error(err))
	}
	sugar.Info("✅ Database connected")

	engine := matcher.NewSmartMatchEngine(db, sugar)
	port := os.Getenv("ENGINE_PORT")
	if port == "" {
		port = "50051"
	}
	app := handler.NewServer(engine, sugar)
	sugar.Infof("🔧 Engine listening on port %s", port)
	if err := app.Listen(fmt.Sprintf(":%s", port)); err != nil {
		sugar.Fatal("Failed to start server", zap.Error(err))
	}
}
