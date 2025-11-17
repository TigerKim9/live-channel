package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/livestation/backend/internal/handler"
	"github.com/livestation/backend/internal/middleware"
	"github.com/livestation/backend/internal/repository"
	"github.com/livestation/backend/internal/service"
	"github.com/livestation/backend/internal/websocket"
	"github.com/livestation/backend/pkg/cache"
	"github.com/livestation/backend/pkg/config"
	"github.com/livestation/backend/pkg/database"
	"github.com/livestation/backend/pkg/logger"
)

func main() {
	// Initialize logger
	log := logger.NewLogger()
	log.Info("Starting Live Station Backend Server...")

	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load configuration: ", err)
	}

	// Initialize database
	db, err := database.NewPostgresDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}
	log.Info("Database connected successfully")

	// Initialize Redis
	redisClient, err := cache.NewRedisClient(cfg)
	if err != nil {
		log.Fatal("Failed to connect to Redis: ", err)
	}
	log.Info("Redis connected successfully")

	// Initialize repositories
	streamRepo := repository.NewStreamRepository(db)
	userRepo := repository.NewUserRepository(db)
	recordingRepo := repository.NewRecordingRepository(db)

	// Initialize services
	streamService := service.NewStreamService(streamRepo, redisClient, cfg)
	userService := service.NewUserService(userRepo, cfg)
	recordingService := service.NewRecordingService(recordingRepo, cfg)
	hookService := service.NewHookService(streamService, recordingService, log)

	// Initialize WebSocket hub
	wsHub := websocket.NewHub()
	go wsHub.Run()

	// Initialize Gin router
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.Default()

	// Middleware
	router.Use(middleware.CORS())
	router.Use(middleware.Logger(log))
	router.Use(middleware.Recovery(log))

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"time":   time.Now().Unix(),
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Authentication
		authHandler := handler.NewAuthHandler(userService, cfg)
		v1.POST("/auth/register", authHandler.Register)
		v1.POST("/auth/login", authHandler.Login)

		// Protected routes
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			// Stream management
			streamHandler := handler.NewStreamHandler(streamService, wsHub)
			protected.POST("/streams", streamHandler.CreateStream)
			protected.GET("/streams", streamHandler.ListStreams)
			protected.GET("/streams/:id", streamHandler.GetStream)
			protected.PUT("/streams/:id", streamHandler.UpdateStream)
			protected.DELETE("/streams/:id", streamHandler.DeleteStream)
			protected.POST("/streams/:id/start", streamHandler.StartStream)
			protected.POST("/streams/:id/stop", streamHandler.StopStream)

			// Recording management
			recordingHandler := handler.NewRecordingHandler(recordingService)
			protected.GET("/recordings", recordingHandler.ListRecordings)
			protected.GET("/recordings/:id", recordingHandler.GetRecording)
			protected.DELETE("/recordings/:id", recordingHandler.DeleteRecording)

			// User profile
			userHandler := handler.NewUserHandler(userService)
			protected.GET("/users/me", userHandler.GetProfile)
			protected.PUT("/users/me", userHandler.UpdateProfile)
		}

		// SRS Hooks (no auth required - internal calls from SRS)
		hookHandler := handler.NewHookHandler(hookService, log)
		v1.POST("/hooks/on_publish", hookHandler.OnPublish)
		v1.POST("/hooks/on_unpublish", hookHandler.OnUnpublish)
		v1.POST("/hooks/on_play", hookHandler.OnPlay)
		v1.POST("/hooks/on_stop", hookHandler.OnStop)
		v1.POST("/hooks/on_dvr", hookHandler.OnDVR)
		v1.POST("/hooks/on_hls", hookHandler.OnHLS)
	}

	// WebSocket endpoint
	router.GET("/ws", func(c *gin.Context) {
		websocket.ServeWs(wsHub, c.Writer, c.Request)
	})

	// Create HTTP server
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%s", cfg.BackendPort),
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		log.Info(fmt.Sprintf("Server starting on port %s", cfg.BackendPort))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Failed to start server: ", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown: ", err)
	}

	log.Info("Server exited")
}
