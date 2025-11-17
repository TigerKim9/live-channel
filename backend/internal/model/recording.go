package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RecordingStatus string

const (
	RecordingStatusProcessing RecordingStatus = "processing"
	RecordingStatusCompleted  RecordingStatus = "completed"
	RecordingStatusFailed     RecordingStatus = "failed"
)

type Recording struct {
	ID          uuid.UUID       `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	StreamID    uuid.UUID       `gorm:"type:uuid;not null" json:"stream_id"`
	Filename    string          `json:"filename"`
	FilePath    string          `json:"file_path"`
	S3URL       string          `json:"s3_url"`
	Duration    int             `json:"duration"` // seconds
	FileSize    int64           `json:"file_size"` // bytes
	Format      string          `json:"format"` // flv, mp4
	Status      RecordingStatus `gorm:"default:'processing'" json:"status"`
	ThumbnailURL string         `json:"thumbnail_url"`
	StartedAt   time.Time       `json:"started_at"`
	EndedAt     *time.Time      `json:"ended_at"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	DeletedAt   gorm.DeletedAt  `gorm:"index" json:"-"`

	// Relationships
	Stream Stream `gorm:"foreignKey:StreamID" json:"stream,omitempty"`
}
