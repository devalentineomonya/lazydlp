package components

import (
	"github.com/gdamore/tcell/v2"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/config"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui/theme"
	"github.com/rivo/tview"
)

// OptionsForm is a form for editing DownloadProfile.
type OptionsForm struct {
	*tview.Form
	profile config.DownloadProfile
}

// NewOptionsForm creates a new options form.
func NewOptionsForm(profile config.DownloadProfile) *OptionsForm {
	f := tview.NewForm()
	f.SetBorder(true).
		SetTitle(" Options ").
		SetTitleAlign(theme.BorderTitleAlign).
		SetBorderColor(theme.ColorGray)

	f.SetBackgroundColor(theme.ColorBackground)
	f.SetFieldBackgroundColor(theme.ColorBackground)
	f.SetFieldTextColor(theme.ColorForeground)
	f.SetButtonBackgroundColor(theme.ColorOrange)
	f.SetButtonTextColor(tcell.ColorBlack)
	f.SetLabelColor(theme.ColorOrange)

	of := &OptionsForm{
		Form:    f,
		profile: profile,
	}

	of.setupFields()

	return of
}

func (of *OptionsForm) setupFields() {
	of.AddInputField("Format", of.profile.Format, 0, nil, func(text string) {
		of.profile.Format = text
	})
	of.AddCheckbox("Embed Subs", of.profile.EmbedSubs, func(checked bool) {
		of.profile.EmbedSubs = checked
	})
	of.AddCheckbox("Embed Metadata", of.profile.EmbedMetadata, func(checked bool) {
		of.profile.EmbedMetadata = checked
	})
	of.AddCheckbox("Embed Thumbnail", of.profile.EmbedThumbnail, func(checked bool) {
		of.profile.EmbedThumbnail = checked
	})
	of.AddInputField("Output Template", of.profile.OutputTemplate, 0, nil, func(text string) {
		of.profile.OutputTemplate = text
	})
}

// GetProfile returns the current profile in the form.
func (of *OptionsForm) GetProfile() config.DownloadProfile {
	return of.profile
}
