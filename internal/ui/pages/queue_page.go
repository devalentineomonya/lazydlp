package pages

import (
	"fmt"
	"github.com/gdamore/tcell/v2"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/downloader"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui/theme"
	"github.com/rivo/tview"
)

// QueuePage displays the current download queue.
type QueuePage struct {
	*tview.Table
	manager *downloader.Manager
}

// NewQueuePage creates a new queue page.
func NewQueuePage(manager *downloader.Manager) *QueuePage {
	t := tview.NewTable().SetSelectable(true, false).SetFixed(1, 1)
	t.SetBorder(true).
		SetTitle(" Queue ").
		SetTitleAlign(theme.BorderTitleAlign).
		SetBorderColor(theme.ColorGray)

	t.SetBackgroundColor(theme.ColorBackground)
	t.SetSelectedStyle(tview.NewTableCell("").
		SetBackgroundColor(theme.ColorOrange).
		SetTextColor(tcell.ColorBlack).
		Style)

	p := &QueuePage{
		Table:   t,
		manager: manager,
	}

	p.Update()

	return p
}

// Update updates the queue table.
func (p *QueuePage) Update() {
	p.Clear()

	headers := []string{"ID", "Title", "Status", "Progress", "Speed", "ETA"}
	for i, header := range headers {
		p.SetCell(0, i, tview.NewTableCell(header).
			SetTextColor(theme.ColorOrange).
			SetSelectable(false))
	}

	jobs := p.manager.GetJobs()
	row := 1
	for _, job := range jobs {
		info := job.GetInfo()
		// Only show non-finished jobs or recently finished ones? 
		// Usually queue shows what's pending/active.
		if info.Status == downloader.StatusCompleted || info.Status == downloader.StatusFailed || info.Status == downloader.StatusCancelled {
			continue
		}

		p.SetCell(row, 0, tview.NewTableCell(info.ID).SetTextColor(theme.ColorGray))
		title := info.Title
		if title == "" {
			title = info.URL
		}
		p.SetCell(row, 1, tview.NewTableCell(title).SetTextColor(theme.ColorForeground))
		p.SetCell(row, 2, tview.NewTableCell(string(info.Status)).SetTextColor(theme.ColorOrange))
		p.SetCell(row, 3, tview.NewTableCell(fmt.Sprintf("%.1f%%", info.Progress)).SetTextColor(theme.ColorProgress))
		p.SetCell(row, 4, tview.NewTableCell(info.Speed).SetTextColor(theme.ColorGray))
		p.SetCell(row, 5, tview.NewTableCell(info.ETA).SetTextColor(theme.ColorGray))
		row++
	}
}
