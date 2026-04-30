package components

import (
	"fmt"
	"strings"

	"github.com/gdamore/tcell/v2"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/downloader"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui/theme"
	"github.com/rivo/tview"
)

// DownloadsTable displays active and finished download jobs.
type DownloadsTable struct {
	*tview.Table
	manager *downloader.Manager
}

// NewDownloadsTable creates a new DownloadsTable.
func NewDownloadsTable(manager *downloader.Manager) *DownloadsTable {
	t := &DownloadsTable{
		Table:   tview.NewTable(),
		manager: manager,
	}

	t.SetFixed(1, 0)
	t.SetSelectable(true, false)
	t.SetBorder(true)
	t.SetTitle(" Downloads ")
	t.SetSeparator(tview.Borders.Vertical)

	t.headers()
	return t
}

func (t *DownloadsTable) headers() {
	headers := []string{"ID", "Title", "Status", "Progress", "Speed", "ETA", "Format"}
	for i, h := range headers {
		t.SetCell(0, i, tview.NewTableCell(h).
			SetTextColor(theme.ColorOrange).
			SetSelectable(false).
			SetExpansion(1).
			SetAlign(tview.AlignCenter))
	}
}

// Update refreshes the table content from the manager.
func (t *DownloadsTable) Update() {
	jobs := t.manager.GetJobs()
	
	// Keep the header
	t.Clear()
	t.headers()

	for i, job := range jobs {
		info := job.GetInfo()
		row := i + 1

		title := info.Title
		if title == "" {
			title = info.URL
		}

		statusColor := tcell.ColorDefault
		switch info.Status {
		case downloader.StatusDownloading:
			statusColor = theme.ColorWarning
		case downloader.StatusCompleted:
			statusColor = theme.ColorSuccess
		case downloader.StatusFailed:
			statusColor = theme.ColorError
		case downloader.StatusQueued:
			statusColor = theme.ColorGray
		}

		progressStr := progressBar(info.Progress, 10)
		
		t.SetCell(row, 0, tview.NewTableCell(info.ID).SetAlign(tview.AlignCenter))
		t.SetCell(row, 1, tview.NewTableCell(title).SetMaxWidth(40).SetExpansion(2))
		t.SetCell(row, 2, tview.NewTableCell(string(info.Status)).SetTextColor(statusColor).SetAlign(tview.AlignCenter))
		t.SetCell(row, 3, tview.NewTableCell(fmt.Sprintf("%s %5.1f%%", progressStr, info.Progress)).SetAlign(tview.AlignCenter))
		t.SetCell(row, 4, tview.NewTableCell(info.Speed).SetAlign(tview.AlignCenter))
		t.SetCell(row, 5, tview.NewTableCell(info.ETA).SetAlign(tview.AlignCenter))
		t.SetCell(row, 6, tview.NewTableCell(info.Profile.Format).SetAlign(tview.AlignCenter))
	}
}

func progressBar(percent float64, width int) string {
	if percent < 0 {
		percent = 0
	}
	if percent > 100 {
		percent = 100
	}

	completeWidth := int(float64(width) * percent / 100.0)
	if completeWidth > width {
		completeWidth = width
	}

	// Use Unicode block characters for a smooth progress bar
	// █ (U+2588) Full block
	// ░ (U+2591) Light shade
	
	complete := strings.Repeat("█", completeWidth)
	incomplete := strings.Repeat("░", width-completeWidth)
	
	return fmt.Sprintf("[%s%s]", complete, incomplete)
}
