package downloader

import (
	"sync"
	"time"

	"github.com/lazy-ytdlp/lazy-ytdlp/internal/config"
)

// DownloadStatus represents the current state of a download job.
type DownloadStatus string

const (
	StatusQueued      DownloadStatus = "Queued"
	StatusDownloading DownloadStatus = "Downloading"
	StatusCompleted   DownloadStatus = "Completed"
	StatusFailed      DownloadStatus = "Failed"
	StatusCancelled   DownloadStatus = "Cancelled"
	StatusPaused      DownloadStatus = "Paused"
)

// DownloadJob represents a single download task.
type DownloadJob struct {
	ID             string                `json:"id"`
	URL            string                `json:"url"`
	Profile        config.DownloadProfile `json:"profile"`
	Status         DownloadStatus        `json:"status"`
	Progress       float64               `json:"progress"`
	TotalSize      string                `json:"total_size"`
	Speed          string                `json:"speed"`
	ETA            string                `json:"eta"`
	Title          string                `json:"title"`
	OutputPath     string                `json:"output_path"`
	Error          string                `json:"error"`
	CreatedAt      time.Time             `json:"created_at"`
	FinishedAt     time.Time             `json:"finished_at"`
	
	mu sync.RWMutex
}

// NewDownloadJob creates a new download job.
func NewDownloadJob(id, url string, profile config.DownloadProfile) *DownloadJob {
	return &DownloadJob{
		ID:        id,
		URL:       url,
		Profile:   profile,
		Status:    StatusQueued,
		CreatedAt: time.Now(),
	}
}

// Update updates the job's progress information.
func (j *DownloadJob) Update(progress float64, size, speed, eta string) {
	j.mu.Lock()
	defer j.mu.Unlock()
	j.Progress = progress
	j.TotalSize = size
	j.Speed = speed
	j.ETA = eta
}

// SetStatus updates the job's status.
func (j *DownloadJob) SetStatus(status DownloadStatus) {
	j.mu.Lock()
	defer j.mu.Unlock()
	j.Status = status
	if status == StatusCompleted || status == StatusFailed || status == StatusCancelled {
		j.FinishedAt = time.Now()
	}
}

// SetTitle updates the job's title.
func (j *DownloadJob) SetTitle(title string) {
	j.mu.Lock()
	defer j.mu.Unlock()
	j.Title = title
}

// SetOutputPath updates the job's output path.
func (j *DownloadJob) SetOutputPath(path string) {
	j.mu.Lock()
	defer j.mu.Unlock()
	j.OutputPath = path
}

// SetError updates the job's error message.
func (j *DownloadJob) SetError(err string) {
	j.mu.Lock()
	defer j.mu.Unlock()
	j.Error = err
}

// JobInfo represents a snapshot of a download job's state.
type JobInfo struct {
	ID             string                `json:"id"`
	URL            string                `json:"url"`
	Profile        config.DownloadProfile `json:"profile"`
	Status         DownloadStatus        `json:"status"`
	Progress       float64               `json:"progress"`
	TotalSize      string                `json:"total_size"`
	Speed          string                `json:"speed"`
	ETA            string                `json:"eta"`
	Title          string                `json:"title"`
	OutputPath     string                `json:"output_path"`
	Error          string                `json:"error"`
	CreatedAt      time.Time             `json:"created_at"`
	FinishedAt     time.Time             `json:"finished_at"`
}

// GetInfo returns a snapshot of the job's current state.
func (j *DownloadJob) GetInfo() JobInfo {
	j.mu.RLock()
	defer j.mu.RUnlock()
	return JobInfo{
		ID:         j.ID,
		URL:        j.URL,
		Profile:    j.Profile,
		Status:     j.Status,
		Progress:   j.Progress,
		TotalSize:  j.TotalSize,
		Speed:      j.Speed,
		ETA:        j.ETA,
		Title:      j.Title,
		OutputPath: j.OutputPath,
		Error:      j.Error,
		CreatedAt:  j.CreatedAt,
		FinishedAt: j.FinishedAt,
	}
}
