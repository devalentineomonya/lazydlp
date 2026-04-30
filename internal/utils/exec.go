package utils

import (
	"os/exec"
)

// FindYtDlp looks for yt-dlp in the system's PATH.
func FindYtDlp() (string, error) {
	return exec.LookPath("ytdlp")
}
