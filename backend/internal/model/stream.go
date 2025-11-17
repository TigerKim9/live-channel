package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type StreamStatus string

const (
	StreamStatusOffline StreamStatus = "offline"
	StreamStatusLive    StreamStatus = "live"
	StreamStatusError   StreamStatus = "error"
)

type Stream struct {
	ID          uuid.UUID    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID    `gorm:"type:uuid;not null" json:"user_id"`
	StreamKey   string       `gorm:"uniqueIndex;not null" json:"stream_key"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	ThumbnailURL string      `json:"thumbnail_url"`
	Status      StreamStatus `gorm:"default:'offline'" json:"status"`
	RTMPUrl     string       `json:"rtmp_url"`
	HLSUrl      string       `json:"hls_url"`
	ViewerCount int          `gorm:"default:0" json:"viewer_count"`
	IsPublic    bool         `gorm:"default:true" json:"is_public"`

	// Time Machine settings
	TimeMachineEnabled  bool `gorm:"default:true" json:"time_machine_enabled"`
	TimeMachineDuration int  `gorm:"default:21600" json:"time_machine_duration"` // seconds

	// Recording settings
	RecordingEnabled bool   `gorm:"default:true" json:"recording_enabled"`
	RecordingPath    string `json:"recording_path"`

	// Re-stream settings
	RestreamEnabled bool   `json:"restream_enabled"`
	RestreamTargets string `gorm:"type:text" json:"restream_targets"` // JSON array

	// Transcoding settings
	TranscodingEnabled  bool   `gorm:"default:true" json:"transcoding_enabled"`
	TranscodingProfiles string `json:"transcoding_profiles"` // 360p,480p,720p,1080p

	StartedAt *time.Time `json:"started_at"`
	EndedAt   *time.Time `json:"ended_at"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	User       User            `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Recordings []Recording     `gorm:"foreignKey:StreamID" json:"recordings,omitempty"`
	Sessions   []StreamSession `gorm:"foreignKey:StreamID" json:"sessions,omitempty"`
}

type StreamSession struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	StreamID  uuid.UUID `gorm:"type:uuid;not null" json:"stream_id"`
	StartedAt time.Time `json:"started_at"`
	EndedAt   *time.Time `json:"ended_at"`
	Duration  int       `json:"duration"` // seconds
	PeakViewers int     `json:"peak_viewers"`
	AvgBitrate  int     `json:"avg_bitrate"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type StreamQuality struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	StreamID   uuid.UUID `gorm:"type:uuid;not null" json:"stream_id"`
	Quality    string    `json:"quality"` // 360p, 480p, 720p, 1080p
	Resolution string    `json:"resolution"` // 640x360, 854x480, 1280x720, 1920x1080
	Bitrate    int       `json:"bitrate"` // kbps
	HLSUrl     string    `json:"hls_url"`
	IsEnabled  bool      `gorm:"default:true" json:"is_enabled"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
