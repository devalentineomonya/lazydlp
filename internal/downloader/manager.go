package downloader

import (
	"context"
	"fmt"
	"io"
	"sync"

	"github.com/lazy-ytdlp/lazy-ytdlp/internal/config"
)

// Manager handles the download queue and active downloads.
type Manager struct {
	jobs          []*DownloadJob
	activeJobs    map[string]context.CancelFunc
	maxConcurrent int
	queueChan     chan *DownloadJob
	LogWriter     io.Writer

	mu sync.RWMutex
}

// NewManager creates a new download manager.
func NewManager(cfg *config.AppConfig) *Manager {
	m := &Manager{
		jobs:          []*DownloadJob{},
		activeJobs:    make(map[string]context.CancelFunc),
		maxConcurrent: cfg.MaxConcurrent,
		queueChan:     make(chan *DownloadJob, 100),
	}
	
	go m.startWorkerPool()
	
	return m
}

// AddJob adds a new job to the manager.
func (m *Manager) AddJob(url string, profile config.DownloadProfile) *DownloadJob {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	id := fmt.Sprintf("%d", len(m.jobs)+1)
	job := NewDownloadJob(id, url, profile)
	m.jobs = append(m.jobs, job)
	
	m.queueChan <- job
	return job
}

// CancelJob cancels an active job.
func (m *Manager) CancelJob(id string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	
	if cancel, ok := m.activeJobs[id]; ok {
		cancel()
		delete(m.activeJobs, id)
	} else {
		// If job is in queue but not active yet, we need a way to mark it as cancelled
		for _, job := range m.jobs {
			if job.ID == id && job.Status == StatusQueued {
				job.SetStatus(StatusCancelled)
			}
		}
	}
}

// GetJobs returns a list of all jobs.
func (m *Manager) GetJobs() []*DownloadJob {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	// Return a copy of the slice to avoid race conditions
	jobsCopy := make([]*DownloadJob, len(m.jobs))
	copy(jobsCopy, m.jobs)
	return jobsCopy
}

func (m *Manager) startWorkerPool() {
	sem := make(chan struct{}, m.maxConcurrent)
	
	for job := range m.queueChan {
		sem <- struct{}{}
		
		go func(j *DownloadJob) {
			defer func() { <-sem }()
			
			// Check if job was cancelled while in queue
			if j.GetInfo().Status == StatusCancelled {
				return
			}
			
			ctx, cancel := context.WithCancel(context.Background())
			
			m.mu.Lock()
			m.activeJobs[j.ID] = cancel
			m.mu.Unlock()
			
			RunJob(ctx, j, m.LogWriter)
			
			m.mu.Lock()
			delete(m.activeJobs, j.ID)
			m.mu.Unlock()
		}(job)
	}
}
