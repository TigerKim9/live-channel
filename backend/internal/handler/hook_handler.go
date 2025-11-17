package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/livestation/backend/internal/service"
	"github.com/sirupsen/logrus"
)

type HookHandler struct {
	hookService service.HookService
	log         *logrus.Logger
}

func NewHookHandler(hookService service.HookService, log *logrus.Logger) *HookHandler {
	return &HookHandler{
		hookService: hookService,
		log:         log,
	}
}

type SRSHookRequest struct {
	Action    string `json:"action"`
	ClientID  string `json:"client_id"`
	IP        string `json:"ip"`
	VHost     string `json:"vhost"`
	App       string `json:"app"`
	Stream    string `json:"stream"`
	Param     string `json:"param"`
	StreamKey string `json:"stream"`
	File      string `json:"file"`
}

func (h *HookHandler) OnPublish(c *gin.Context) {
	var req SRSHookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.WithError(err).Error("Invalid hook request")
		c.JSON(http.StatusOK, gin.H{"code": 1}) // Return error code to SRS
		return
	}

	if err := h.hookService.OnPublish(req.Stream, req.IP); err != nil {
		h.log.WithError(err).Error("OnPublish failed")
		c.JSON(http.StatusOK, gin.H{"code": 1})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0}) // Success
}

func (h *HookHandler) OnUnpublish(c *gin.Context) {
	var req SRSHookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"code": 0})
		return
	}

	_ = h.hookService.OnUnpublish(req.Stream)
	c.JSON(http.StatusOK, gin.H{"code": 0})
}

func (h *HookHandler) OnPlay(c *gin.Context) {
	var req SRSHookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"code": 0})
		return
	}

	_ = h.hookService.OnPlay(req.Stream, req.IP)
	c.JSON(http.StatusOK, gin.H{"code": 0})
}

func (h *HookHandler) OnStop(c *gin.Context) {
	var req SRSHookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"code": 0})
		return
	}

	_ = h.hookService.OnStop(req.Stream)
	c.JSON(http.StatusOK, gin.H{"code": 0})
}

func (h *HookHandler) OnDVR(c *gin.Context) {
	var req SRSHookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"code": 0})
		return
	}

	_ = h.hookService.OnDVR(req.Stream, req.File)
	c.JSON(http.StatusOK, gin.H{"code": 0})
}

func (h *HookHandler) OnHLS(c *gin.Context) {
	var req SRSHookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"code": 0})
		return
	}

	_ = h.hookService.OnHLS(req.Stream, req.File)
	c.JSON(http.StatusOK, gin.H{"code": 0})
}
