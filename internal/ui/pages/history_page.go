package pages

import (
	"fmt"
	"github.com/gdamore/tcell/v2"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/history"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui/theme"
	"github.com/rivo/tview"
)

// HistoryPage displays the download history.
type HistoryPage struct {
	*tview.Flex
	table     *tview.Table
	searchBar *tview.InputField
	db        *history.DB
}

// NewHistoryPage creates a new history page.
func NewHistoryPage(db *history.DB) *HistoryPage {
	p := &HistoryPage{
		Flex:      tview.NewFlex().SetDirection(tview.FlexRow),
		table:     tview.NewTable().SetSelectable(true, false).SetFixed(1, 1),
		searchBar: tview.NewInputField().SetLabel("Search: "),
		db:        db,
	}

	p.searchBar.SetFieldBackgroundColor(theme.ColorBackground).
		SetFieldTextColor(theme.ColorForeground).
		SetLabelColor(theme.ColorOrange).
		SetBorder(true).
		SetBorderColor(theme.ColorGray)

	p.table.SetBorder(true).
		SetTitle(" History ").
		SetTitleAlign(theme.BorderTitleAlign).
		SetBorderColor(theme.ColorGray)

	p.table.SetBackgroundColor(theme.ColorBackground)
	p.table.SetSelectedStyle(tview.NewTableCell("").
		SetBackgroundColor(theme.ColorOrange).
		SetTextColor(tcell.ColorBlack).
		Style)

	p.searchBar.SetChangedFunc(func(text string) {
		p.refreshTable(text)
	})

	p.AddItem(p.searchBar, 3, 0, false).
		AddItem(p.table, 0, 1, true)

	p.refreshTable("")

	return p
}

func (p *HistoryPage) refreshTable(search string) {
	p.table.Clear()

	headers := []string{"ID", "Title", "Status", "Format", "Profile", "End Time"}
	for i, header := range headers {
		p.table.SetCell(0, i, tview.NewTableCell(header).
			SetTextColor(theme.ColorOrange).
			SetSelectable(false))
	}

	records, err := p.db.ListRecords(search)
	if err != nil {
		p.table.SetCell(1, 0, tview.NewTableCell(fmt.Sprintf("Error: %v", err)).SetTextColor(theme.ColorError))
		return
	}

	for i, r := range records {
		row := i + 1
		p.table.SetCell(row, 0, tview.NewTableCell(fmt.Sprintf("%d", r.ID)).SetTextColor(theme.ColorGray))
		p.table.SetCell(row, 1, tview.NewTableCell(r.Title).SetTextColor(theme.ColorForeground))
		p.table.SetCell(row, 2, tview.NewTableCell(r.Status).SetTextColor(getStatusColor(r.Status)))
		p.table.SetCell(row, 3, tview.NewTableCell(r.Format).SetTextColor(theme.ColorGray))
		p.table.SetCell(row, 4, tview.NewTableCell(r.Profile).SetTextColor(theme.ColorGray))
		p.table.SetCell(row, 5, tview.NewTableCell(r.EndTime.Format("2006-01-02 15:04:05")).SetTextColor(theme.ColorGray))
	}
}

func getStatusColor(status string) tcell.Color {
	switch status {
	case "completed":
		return theme.ColorSuccess
	case "failed":
		return theme.ColorError
	case "cancelled":
		return theme.ColorWarning
	default:
		return theme.ColorForeground
	}
}
