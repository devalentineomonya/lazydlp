package components

import (
	"fmt"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui/theme"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/utils"
	"github.com/rivo/tview"
)

// LogViewer is a scrollable text view for logs.
type LogViewer struct {
	*tview.TextView
	tailMode bool
}

// NewLogViewer creates a new log viewer.
func NewLogViewer() *LogViewer {
	tv := tview.NewTextView().
		SetDynamicColors(true).
		SetRegions(true).
		SetWordWrap(true).
		SetChangedFunc(func() {
			// No-op for now
		})

	tv.SetBorder(true).
		SetTitle(" Logs ").
		SetTitleAlign(theme.BorderTitleAlign).
		SetBorderColor(theme.ColorGray)

	tv.SetBackgroundColor(theme.ColorBackground)

	lv := &LogViewer{
		TextView: tv,
		tailMode: true,
	}

	return lv
}

// Write appends a line to the log viewer.
func (lv *LogViewer) Write(p []byte) (n int, err error) {
	line := string(p)
	colorized := utils.Colorize(line)
	fmt.Fprintf(lv.TextView, "%s", colorized)
	if lv.tailMode {
		lv.ScrollToEnd()
	}
	return len(p), nil
}

// ToggleTailMode toggles automatic scrolling.
func (lv *LogViewer) ToggleTailMode() {
	lv.tailMode = !lv.tailMode
	if lv.tailMode {
		lv.SetTitle(" Logs (Tail ON) ")
	} else {
		lv.SetTitle(" Logs (Tail OFF) ")
	}
}
