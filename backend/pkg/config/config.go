package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	// Application
	AppEnv  string
	AppName string

	// Server
	BackendPort string
	BackendHost string

	// Database
	PostgresHost     string
	PostgresPort     string
	PostgresUser     string
	PostgresPassword string
	PostgresDB       string

	// Redis
	RedisHost     string
	RedisPort     string
	RedisPassword string

	// JWT
	JWTSecret string
	JWTExpiry string

	// AWS
	AWSRegion          string
	AWSAccessKeyID     string
	AWSSecretAccessKey string
	AWSS3Bucket        string
	AWSCloudFrontDomain string

	// SRS
	SRSHTTPPort    string
	SRSRTMPPort    string
	SRSHTTPAPIPort string

	// Storage
	RecordingPath  string
	HLSPath        string
	ThumbnailPath  string

	// Transcoding
	FFmpegThreads       string
	TranscodingProfiles string

	// Time Machine
	TimeMachineDuration        string
	TimeMachineSegmentDuration string
}

func LoadConfig() (*Config, error) {
	// Load .env file if exists (for local development)
	_ = godotenv.Load()

	cfg := &Config{
		AppEnv:  getEnv("APP_ENV", "development"),
		AppName: getEnv("APP_NAME", "LiveStation"),

		BackendPort: getEnv("BACKEND_PORT", "8080"),
		BackendHost: getEnv("BACKEND_HOST", "0.0.0.0"),

		PostgresHost:     getEnv("POSTGRES_HOST", "localhost"),
		PostgresPort:     getEnv("POSTGRES_PORT", "5432"),
		PostgresUser:     getEnv("POSTGRES_USER", "livestation"),
		PostgresPassword: getEnv("POSTGRES_PASSWORD", "livestation_password"),
		PostgresDB:       getEnv("POSTGRES_DB", "livestation"),

		RedisHost:     getEnv("REDIS_HOST", "localhost"),
		RedisPort:     getEnv("REDIS_PORT", "6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),

		JWTSecret: getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
		JWTExpiry: getEnv("JWT_EXPIRY", "24h"),

		AWSRegion:           getEnv("AWS_REGION", "ap-northeast-2"),
		AWSAccessKeyID:      getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretAccessKey:  getEnv("AWS_SECRET_ACCESS_KEY", ""),
		AWSS3Bucket:         getEnv("AWS_S3_BUCKET", "livestation-recordings"),
		AWSCloudFrontDomain: getEnv("AWS_CLOUDFRONT_DOMAIN", ""),

		SRSHTTPPort:    getEnv("SRS_HTTP_PORT", "8080"),
		SRSRTMPPort:    getEnv("SRS_RTMP_PORT", "1935"),
		SRSHTTPAPIPort: getEnv("SRS_HTTP_API_PORT", "1985"),

		RecordingPath: getEnv("RECORDING_PATH", "/var/recordings"),
		HLSPath:       getEnv("HLS_PATH", "/var/hls"),
		ThumbnailPath: getEnv("THUMBNAIL_PATH", "/var/thumbnails"),

		FFmpegThreads:       getEnv("FFMPEG_THREADS", "4"),
		TranscodingProfiles: getEnv("TRANSCODING_PROFILES", "360p,480p,720p,1080p"),

		TimeMachineDuration:        getEnv("TIMEMACHINE_DURATION", "21600"),
		TimeMachineSegmentDuration: getEnv("TIMEMACHINE_SEGMENT_DURATION", "10"),
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
