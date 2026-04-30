package history

import "time"

// HistoryRecord represents a finished or failed download job.
type HistoryRecord struct {
	ID         int64     `json:"id"`
	URL        string    `json:"url"`
	Title      string    `json:"title"`
	OutputPath string    `json:"output_path"`
	Status     string    `json:"status"` // completed, failed, cancelled
	StartTime  time.Time `json:"start_time"`
	EndTime    time.Time `json:"end_time"`
	FileSize   int64     `json:"file_size"`
	Format     string    `json:"format"`
	Profile    string    `json:"profile"`
	Error      string    `json:"error,omitempty"`
}
