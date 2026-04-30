package pages

import (
	"fmt"
	"github.com/gdamore/tcell/v2"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/config"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui/theme"
	"github.com/rivo/tview"
)

// SettingsPage is a form for global application settings.
type SettingsPage struct {
	*tview.Form
	config *config.AppConfig
}

// NewSettingsPage creates a new settings page.
func NewSettingsPage(cfg *config.AppConfig) *SettingsPage {
	f := tview.NewForm()
	f.SetBorder(true).
		SetTitle(" Settings ").
		SetTitleAlign(theme.BorderTitleAlign).
		SetBorderColor(theme.ColorGray)

	f.SetBackgroundColor(theme.ColorBackground)
	f.SetFieldBackgroundColor(theme.ColorBackground)
	f.SetFieldTextColor(theme.ColorForeground)
	f.SetButtonBackgroundColor(theme.ColorOrange)
	f.SetButtonTextColor(tcell.ColorBlack)
	f.SetLabelColor(theme.ColorOrange)

	p := &SettingsPage{
		Form:   f,
		config: cfg,
	}

	p.setupFields()

	return p
}

func (p *SettingsPage) setupFields() {
	p.AddInputField("Download Directory", p.config.DownloadDir, 0, nil, func(text string) {
		p.config.DownloadDir = text
	})

	p.AddInputField("Max Concurrent Downloads", fmt.Sprintf("%d", p.config.MaxConcurrent), 5, nil, func(text string) {
		var val int
		fmt.Sscanf(text, "%d", &val)
		if val > 0 {
			p.config.MaxConcurrent = val
		}
	})

	p.AddInputField("History Limit", fmt.Sprintf("%d", p.config.HistoryLimit), 5, nil, func(text string) {
		var val int
		fmt.Sscanf(text, "%d", &val)
		if val > 0 {
			p.config.HistoryLimit = val
		}
	})

	p.AddButton("Save", func() {
		if err := p.config.Save(); err != nil {
			// TODO: Show error modal
		}
	})
}
