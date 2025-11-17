package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/livestation/backend/internal/service"
)

type RecordingHandler struct {
	recordingService service.RecordingService
}

func NewRecordingHandler(recordingService service.RecordingService) *RecordingHandler {
	return &RecordingHandler{
		recordingService: recordingService,
	}
}

func (h *RecordingHandler) ListRecordings(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	var streamID *uuid.UUID
	if streamIDStr := c.Query("stream_id"); streamIDStr != "" {
		id, err := uuid.Parse(streamIDStr)
		if err == nil {
			streamID = &id
		}
	}

	recordings, err := h.recordingService.ListRecordings(streamID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, recordings)
}

func (h *RecordingHandler) GetRecording(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	recording, err := h.recordingService.GetRecording(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recording not found"})
		return
	}

	c.JSON(http.StatusOK, recording)
}

func (h *RecordingHandler) DeleteRecording(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := h.recordingService.DeleteRecording(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Recording deleted successfully"})
}
