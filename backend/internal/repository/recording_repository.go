package repository

import (
	"github.com/google/uuid"
	"github.com/livestation/backend/internal/model"
	"gorm.io/gorm"
)

type RecordingRepository interface {
	Create(recording *model.Recording) error
	GetByID(id uuid.UUID) (*model.Recording, error)
	ListByStreamID(streamID uuid.UUID, limit, offset int) ([]model.Recording, error)
	List(limit, offset int) ([]model.Recording, error)
	Update(recording *model.Recording) error
	Delete(id uuid.UUID) error
}

type recordingRepository struct {
	db *gorm.DB
}

func NewRecordingRepository(db *gorm.DB) RecordingRepository {
	return &recordingRepository{db: db}
}

func (r *recordingRepository) Create(recording *model.Recording) error {
	return r.db.Create(recording).Error
}

func (r *recordingRepository) GetByID(id uuid.UUID) (*model.Recording, error) {
	var recording model.Recording
	err := r.db.Preload("Stream").First(&recording, "id = ?", id).Error
	return &recording, err
}

func (r *recordingRepository) ListByStreamID(streamID uuid.UUID, limit, offset int) ([]model.Recording, error) {
	var recordings []model.Recording
	err := r.db.Preload("Stream").
		Where("stream_id = ?", streamID).
		Limit(limit).Offset(offset).
		Order("started_at DESC").
		Find(&recordings).Error
	return recordings, err
}

func (r *recordingRepository) List(limit, offset int) ([]model.Recording, error) {
	var recordings []model.Recording
	err := r.db.Preload("Stream").
		Limit(limit).Offset(offset).
		Order("started_at DESC").
		Find(&recordings).Error
	return recordings, err
}

func (r *recordingRepository) Update(recording *model.Recording) error {
	return r.db.Save(recording).Error
}

func (r *recordingRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&model.Recording{}, "id = ?", id).Error
}
