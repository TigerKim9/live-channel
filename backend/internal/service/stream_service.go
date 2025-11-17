package service

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/livestation/backend/internal/model"
	"github.com/livestation/backend/internal/repository"
	"github.com/livestation/backend/pkg/config"
	"github.com/redis/go-redis/v9"
)

type StreamService interface {
	CreateStream(userID uuid.UUID, title, description string) (*model.Stream, error)
	GetStream(id uuid.UUID) (*model.Stream, error)
	ListStreams(userID uuid.UUID, limit, offset int) ([]model.Stream, error)
	UpdateStream(id uuid.UUID, updates map[string]interface{}) (*model.Stream, error)
	DeleteStream(id uuid.UUID) error
	StartStream(id uuid.UUID) error
	StopStream(id uuid.UUID) error
	ValidateStreamKey(streamKey string) (*model.Stream, error)
}

type streamService struct {
	repo  repository.StreamRepository
	redis *redis.Client
	cfg   *config.Config
}

func NewStreamService(repo repository.StreamRepository, redis *redis.Client, cfg *config.Config) StreamService {
	return &streamService{
		repo:  repo,
		redis: redis,
		cfg:   cfg,
	}
}

func (s *streamService) CreateStream(userID uuid.UUID, title, description string) (*model.Stream, error) {
	streamKey := generateStreamKey()

	stream := &model.Stream{
		UserID:              userID,
		StreamKey:           streamKey,
		Title:               title,
		Description:         description,
		Status:              model.StreamStatusOffline,
		RTMPUrl:             fmt.Sprintf("rtmp://localhost:%s/live/%s", s.cfg.SRSRTMPPort, streamKey),
		HLSUrl:              fmt.Sprintf("http://localhost:%s/live/%s.m3u8", s.cfg.SRSHTTPPort, streamKey),
		TimeMachineEnabled:  true,
		TimeMachineDuration: 21600,
		RecordingEnabled:    true,
		TranscodingEnabled:  true,
		TranscodingProfiles: "360p,480p,720p,1080p",
	}

	if err := s.repo.Create(stream); err != nil {
		return nil, err
	}

	return stream, nil
}

func (s *streamService) GetStream(id uuid.UUID) (*model.Stream, error) {
	return s.repo.GetByID(id)
}

func (s *streamService) ListStreams(userID uuid.UUID, limit, offset int) ([]model.Stream, error) {
	return s.repo.List(userID, limit, offset)
}

func (s *streamService) UpdateStream(id uuid.UUID, updates map[string]interface{}) (*model.Stream, error) {
	stream, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if title, ok := updates["title"].(string); ok {
		stream.Title = title
	}
	if description, ok := updates["description"].(string); ok {
		stream.Description = description
	}

	if err := s.repo.Update(stream); err != nil {
		return nil, err
	}

	return stream, nil
}

func (s *streamService) DeleteStream(id uuid.UUID) error {
	return s.repo.Delete(id)
}

func (s *streamService) StartStream(id uuid.UUID) error {
	now := time.Now()
	stream, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	stream.Status = model.StreamStatusLive
	stream.StartedAt = &now

	return s.repo.Update(stream)
}

func (s *streamService) StopStream(id uuid.UUID) error {
	now := time.Now()
	stream, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	stream.Status = model.StreamStatusOffline
	stream.EndedAt = &now

	return s.repo.Update(stream)
}

func (s *streamService) ValidateStreamKey(streamKey string) (*model.Stream, error) {
	return s.repo.GetByStreamKey(streamKey)
}

func generateStreamKey() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
