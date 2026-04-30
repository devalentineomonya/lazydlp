package ui

import (
	"fmt"
	"strings"
	"time"

	"github.com/lazy-ytdlp/lazy-ytdlp/internal/config"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/downloader"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/history"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui/components"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui/pages"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui/theme"
	"github.com/gdamore/tcell/v2"
	"github.com/rivo/tview"
)

// App is the main application struct.
type App struct {
	Application *tview.Application
	Pages       *tview.Pages
	TopNav      *tview.TextView
	StatusBar   *components.StatusBar
	Config      *config.AppConfig
	Manager     *downloader.Manager
	HistoryDB   *history.DB
}

// NewApp creates a new application instance.
func NewApp(cfg *config.AppConfig, mgr *downloader.Manager, db *history.DB) *App {
	a := &App{
		Application: tview.NewApplication(),
		Pages:       tview.NewPages(),
		TopNav:      tview.NewTextView().SetDynamicColors(true).SetTextAlign(tview.AlignCenter),
		StatusBar:   components.NewStatusBar(),
		Config:      cfg,
		Manager:     mgr,
		HistoryDB:   db,
	}

	a.TopNav.SetBackgroundColor(theme.ColorBackground)
	a.updateTopNav("Downloads")

	// Layout
	mainFlex := tview.NewFlex().SetDirection(tview.FlexRow).
		AddItem(a.TopNav, 1, 0, false).
		AddItem(a.Pages, 0, 1, true).
		AddItem(a.StatusBar, 1, 0, false)

	a.Application.SetRoot(mainFlex, true)
	a.Application.EnableMouse(true)

	// Add pages
	downloads := pages.NewDownloadsPage(a.Manager)
	queue := pages.NewQueuePage(a.Manager)
	historyPage := pages.NewHistoryPage(a.HistoryDB)
	settings := pages.NewSettingsPage(a.Config)

	a.Pages.AddPage("Downloads", downloads, true, true)
	a.Pages.AddPage("Queue", queue, true, false)
	a.Pages.AddPage("History", historyPage, true, false)
	a.Pages.AddPage("Settings", settings, true, false)

	// Global keybindings
	a.Application.SetInputCapture(a.handleKeyEvents)

	go a.updateLoop()

	return a
}

func (a *App) updateLoop() {
	ticker := time.NewTicker(500 * time.Millisecond)
	for range ticker.C {
		a.Application.QueueUpdateDraw(func() {
			// Update the active page if it has an Update method
			name, page := a.Pages.GetFrontPage()
			if name == "Downloads" {
				if dp, ok := page.(*pages.DownloadsPage); ok {
					dp.DownloadsTable.Update()
				}
			} else if name == "Queue" {
				if qp, ok := page.(*pages.QueuePage); ok {
					qp.Update()
				}
			}
		})
	}
}

func (a *App) handleKeyEvents(event *tcell.EventKey) *tcell.EventKey {
	// Navigation
	switch event.Key() {
	case tcell.KeyF1:
		a.showPage("Downloads")
	case tcell.KeyF2:
		a.showPage("Queue")
	case tcell.KeyF3:
		a.showPage("History")
	case tcell.KeyF4:
		a.showPage("Settings")
	case tcell.KeyCtrlQ:
		a.Application.Stop()
	}
	return event
}

func (a *App) showPage(name string) {
	a.Pages.SwitchToPage(name)
	a.updateTopNav(name)
}

func (a *App) updateTopNav(active string) {
	items := []string{"Downloads", "Queue", "History", "Settings"}
	var navText []string
	for _, item := range items {
		if item == active {
			navText = append(navText, fmt.Sprintf("[orange]%s[white]", item))
		} else {
			navText = append(navText, item)
		}
	}
	a.TopNav.SetText(" " + strings.Join(navText, " | ") + " ")
}

// Run starts the application.
func (a *App) Run() error {
	return a.Application.Run()
}
