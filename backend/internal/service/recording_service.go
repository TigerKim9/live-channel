package service

import (
	"github.com/google/uuid"
	"github.com/livestation/backend/internal/model"
	"github.com/livestation/backend/internal/repository"
	"github.com/livestation/backend/pkg/config"
)

type RecordingService interface {
	CreateRecording(streamID uuid.UUID, filename, filePath string) (*model.Recording, error)
	GetRecording(id uuid.UUID) (*model.Recording, error)
	ListRecordings(streamID *uuid.UUID, limit, offset int) ([]model.Recording, error)
	DeleteRecording(id uuid.UUID) error
}

type recordingService struct {
	repo repository.RecordingRepository
	cfg  *config.Config
}

func NewRecordingService(repo repository.RecordingRepository, cfg *config.Config) RecordingService {
	return &recordingService{
		repo: repo,
		cfg:  cfg,
	}
}

func (s *recordingService) CreateRecording(streamID uuid.UUID, filename, filePath string) (*model.Recording, error) {
	recording := &model.Recording{
		StreamID: streamID,
		Filename: filename,
		FilePath: filePath,
		Status:   model.RecordingStatusProcessing,
	}

	if err := s.repo.Create(recording); err != nil {
		return nil, err
	}

	return recording, nil
}

func (s *recordingService) GetRecording(id uuid.UUID) (*model.Recording, error) {
	return s.repo.GetByID(id)
}

func (s *recordingService) ListRecordings(streamID *uuid.UUID, limit, offset int) ([]model.Recording, error) {
	if streamID != nil {
		return s.repo.ListByStreamID(*streamID, limit, offset)
	}
	return s.repo.List(limit, offset)
}

func (s *recordingService) DeleteRecording(id uuid.UUID) error {
	return s.repo.Delete(id)
}
