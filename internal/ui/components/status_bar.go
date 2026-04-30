package components

import (
	"fmt"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui/theme"
	"github.com/rivo/tview"
)

// StatusBar is a bottom bar showing dynamic info and key hints.
type StatusBar struct {
	*tview.TextView
}

// NewStatusBar creates a new status bar.
func NewStatusBar() *StatusBar {
	s := &StatusBar{
		TextView: tview.NewTextView().
			SetDynamicColors(true).
			SetTextAlign(tview.AlignLeft).
			SetTextColor(theme.ColorForeground),
	}
	s.SetBackgroundColor(theme.ColorBackground)
	s.SetText(" [orange]↑/↓[white] Navigate  [orange]Enter[white] Select  [orange]Ctrl+C[white] Quit")
	return s
}

// SetStatus updates the status message.
func (s *StatusBar) SetStatus(msg string) {
	s.SetText(fmt.Sprintf(" %s", msg))
}
