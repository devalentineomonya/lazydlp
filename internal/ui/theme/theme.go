package theme

import "github.com/gdamore/tcell/v2"

// Theme constants mimicking terminal.shop
var (
	ColorBackground = tcell.ColorDefault // Transparent
	ColorForeground = tcell.ColorDefault // Use terminal default
	ColorOrange     = tcell.NewHexColor(0xff5f00)
	ColorGray       = tcell.NewHexColor(0x888888)
	ColorSuccess    = tcell.ColorGreen
	ColorError      = tcell.ColorRed
	ColorWarning    = tcell.ColorYellow
	ColorProgress   = tcell.NewHexColor(0x00afff) // Cyan-ish for progress
)

// Styling constants
const (
	BorderTitleAlign = 1 // Left
)
