package utils

import (
	"fmt"
	"strings"
)

// Colorize adds tview color tags to log lines.
func Colorize(line string) string {
	lower := strings.ToLower(line)
	if strings.Contains(lower, "error") {
		return fmt.Sprintf("[red]%s[white]", line)
	}
	if strings.Contains(lower, "warning") {
		return fmt.Sprintf("[yellow]%s[white]", line)
	}
	if strings.Contains(lower, "downloading") {
		return fmt.Sprintf("[cyan]%s[white]", line)
	}
	if strings.Contains(lower, "extracting") {
		return fmt.Sprintf("[green]%s[white]", line)
	}
	return line
}
