package components

import (
	"strings"

	"github.com/gdamore/tcell/v2"
	"github.com/rivo/tview"
)

// URLInput is a multiline text area for entering URLs.
type URLInput struct {
	*tview.TextArea
	onConfirm func(urls []string)
}

// NewURLInput creates a new URLInput.
func NewURLInput(onConfirm func(urls []string)) *URLInput {
	u := &URLInput{
		TextArea:  tview.NewTextArea(),
		onConfirm: onConfirm,
	}

	u.SetBorder(true)
	u.SetTitle(" URLs (one per line) ")
	u.SetPlaceholder("Paste URLs here... (Ctrl+Enter to start)")

	u.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		if event.Key() == tcell.KeyEnter && event.Modifiers()&tcell.ModCtrl != 0 {
			u.confirm()
			return nil
		}
		return event
	})

	return u
}

func (u *URLInput) confirm() {
	text := u.GetText()
	lines := strings.Split(text, "\n")
	var urls []string
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed != "" {
			urls = append(urls, trimmed)
		}
	}

	if len(urls) > 0 {
		u.onConfirm(urls)
		u.SetText("", true)
	}
}
