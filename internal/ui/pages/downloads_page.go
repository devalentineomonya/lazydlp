package pages

import (
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/config"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/downloader"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui/components"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui/theme"
	"github.com/rivo/tview"
)

// DownloadsPage is the main downloads page.
type DownloadsPage struct {
	*tview.Flex
	URLInput       *components.URLInput
	OptionsForm    *components.OptionsForm
	DownloadsTable *components.DownloadsTable
	LogViewer      *components.LogViewer
	Manager        *downloader.Manager
}

// NewDownloadsPage creates a new downloads page.
func NewDownloadsPage(mgr *downloader.Manager) *DownloadsPage {
	p := &DownloadsPage{
		Flex:    tview.NewFlex().SetDirection(tview.FlexRow),
		Manager: mgr,
	}

	p.LogViewer = components.NewLogViewer()
	p.DownloadsTable = components.NewDownloadsTable(mgr)
	
	// Set log writer
	mgr.LogWriter = p.LogViewer

	p.URLInput = components.NewURLInput(func(urls []string) {
		profile := p.OptionsForm.GetProfile()
		for _, url := range urls {
			p.Manager.AddJob(url, profile)
		}
	})

	p.OptionsForm = components.NewOptionsForm(config.DefaultProfile())

	// Layout
	topFlex := tview.NewFlex().
		AddItem(p.URLInput, 0, 1, true).
		AddItem(p.OptionsForm, 40, 0, false)

	p.Flex.
		AddItem(topFlex, 10, 0, true).
		AddItem(p.DownloadsTable, 0, 1, false).
		AddItem(p.LogViewer, 10, 0, false)

	p.SetBackgroundColor(theme.ColorBackground)

	return p
}
