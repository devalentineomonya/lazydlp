package components

import (
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui/theme"
	"github.com/rivo/tview"
)

// Sidebar is a list-based sidebar for navigation.
type Sidebar struct {
	*tview.List
}

// NewSidebar creates a new sidebar.
func NewSidebar() *Sidebar {
	s := &Sidebar{
		List: tview.NewList().
			ShowSecondaryText(false).
			SetMainTextColor(theme.ColorForeground).
			SetSelectedTextColor(theme.ColorOrange).
			SetSelectedBackgroundColor(theme.ColorBackground),
	}
	s.SetBackgroundColor(theme.ColorBackground)
	s.SetBorder(true)
	s.SetBorderColor(theme.ColorGray)
	return s
}
