package repository

import (
	"github.com/google/uuid"
	"github.com/livestation/backend/internal/model"
	"gorm.io/gorm"
)

type StreamRepository interface {
	Create(stream *model.Stream) error
	GetByID(id uuid.UUID) (*model.Stream, error)
	GetByStreamKey(streamKey string) (*model.Stream, error)
	List(userID uuid.UUID, limit, offset int) ([]model.Stream, error)
	Update(stream *model.Stream) error
	Delete(id uuid.UUID) error
	UpdateStatus(id uuid.UUID, status model.StreamStatus) error
	IncrementViewerCount(id uuid.UUID) error
	DecrementViewerCount(id uuid.UUID) error
}

type streamRepository struct {
	db *gorm.DB
}

func NewStreamRepository(db *gorm.DB) StreamRepository {
	return &streamRepository{db: db}
}

func (r *streamRepository) Create(stream *model.Stream) error {
	return r.db.Create(stream).Error
}

func (r *streamRepository) GetByID(id uuid.UUID) (*model.Stream, error) {
	var stream model.Stream
	err := r.db.Preload("User").First(&stream, "id = ?", id).Error
	return &stream, err
}

func (r *streamRepository) GetByStreamKey(streamKey string) (*model.Stream, error) {
	var stream model.Stream
	err := r.db.Preload("User").First(&stream, "stream_key = ?", streamKey).Error
	return &stream, err
}

func (r *streamRepository) List(userID uuid.UUID, limit, offset int) ([]model.Stream, error) {
	var streams []model.Stream
	query := r.db.Preload("User")

	if userID != uuid.Nil {
		query = query.Where("user_id = ?", userID)
	}

	err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&streams).Error
	return streams, err
}

func (r *streamRepository) Update(stream *model.Stream) error {
	return r.db.Save(stream).Error
}

func (r *streamRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&model.Stream{}, "id = ?", id).Error
}

func (r *streamRepository) UpdateStatus(id uuid.UUID, status model.StreamStatus) error {
	return r.db.Model(&model.Stream{}).Where("id = ?", id).Update("status", status).Error
}

func (r *streamRepository) IncrementViewerCount(id uuid.UUID) error {
	return r.db.Model(&model.Stream{}).Where("id = ?", id).
		Update("viewer_count", gorm.Expr("viewer_count + ?", 1)).Error
}

func (r *streamRepository) DecrementViewerCount(id uuid.UUID) error {
	return r.db.Model(&model.Stream{}).Where("id = ?", id).
		Update("viewer_count", gorm.Expr("GREATEST(viewer_count - 1, 0)")).Error
}
