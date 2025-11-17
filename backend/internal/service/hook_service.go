package service

import (
	"github.com/sirupsen/logrus"
)

type HookService interface {
	OnPublish(streamKey, ip string) error
	OnUnpublish(streamKey string) error
	OnPlay(streamKey, ip string) error
	OnStop(streamKey string) error
	OnDVR(streamKey, file string) error
	OnHLS(streamKey, file string) error
}

type hookService struct {
	streamService    StreamService
	recordingService RecordingService
	log              *logrus.Logger
}

func NewHookService(streamService StreamService, recordingService RecordingService, log *logrus.Logger) HookService {
	return &hookService{
		streamService:    streamService,
		recordingService: recordingService,
		log:              log,
	}
}

func (s *hookService) OnPublish(streamKey, ip string) error {
	s.log.WithFields(logrus.Fields{
		"stream_key": streamKey,
		"ip":         ip,
	}).Info("Stream publish started")

	stream, err := s.streamService.ValidateStreamKey(streamKey)
	if err != nil {
		s.log.WithError(err).Error("Invalid stream key")
		return err
	}

	return s.streamService.StartStream(stream.ID)
}

func (s *hookService) OnUnpublish(streamKey string) error {
	s.log.WithFields(logrus.Fields{
		"stream_key": streamKey,
	}).Info("Stream publish stopped")

	stream, err := s.streamService.ValidateStreamKey(streamKey)
	if err != nil {
		return err
	}

	return s.streamService.StopStream(stream.ID)
}

func (s *hookService) OnPlay(streamKey, ip string) error {
	s.log.WithFields(logrus.Fields{
		"stream_key": streamKey,
		"ip":         ip,
	}).Info("Stream play started")

	return nil
}

func (s *hookService) OnStop(streamKey string) error {
	s.log.WithFields(logrus.Fields{
		"stream_key": streamKey,
	}).Info("Stream play stopped")

	return nil
}

func (s *hookService) OnDVR(streamKey, file string) error {
	s.log.WithFields(logrus.Fields{
		"stream_key": streamKey,
		"file":       file,
	}).Info("DVR file created")

	return nil
}

func (s *hookService) OnHLS(streamKey, file string) error {
	s.log.WithFields(logrus.Fields{
		"stream_key": streamKey,
		"file":       file,
	}).Debug("HLS segment created")

	return nil
}
