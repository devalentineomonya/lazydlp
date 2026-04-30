package downloader

import (
	"regexp"
	"strconv"
)

var (
	// [download]  12.3% of  10.5MiB at  1.2MiB/s ETA 00:15
	progressRegex = regexp.MustCompile(`\[download\]\s+([\d.]+)%\s+of\s+(\S+)\s+at\s+(\S+)\s+ETA\s+(\S+)`)
	
	// [download] Destination: Title of the video.mp4
	destinationRegex = regexp.MustCompile(`\[download\] Destination: (.+)`)
	
	// [download] Title of the video.mp4 has already been downloaded
	alreadyDownloadedRegex = regexp.MustCompile(`\[download\] (.+) has already been downloaded`)
)

// ProgressInfo holds parsed progress data.
type ProgressInfo struct {
	Percentage float64
	TotalSize  string
	Speed      string
	ETA        string
}

// ParseProgress parses a line of yt-dlp output and returns progress info if found.
func ParseProgress(line string) (*ProgressInfo, bool) {
	matches := progressRegex.FindStringSubmatch(line)
	if len(matches) == 5 {
		percent, _ := strconv.ParseFloat(matches[1], 64)
		return &ProgressInfo{
			Percentage: percent,
			TotalSize:  matches[2],
			Speed:      matches[3],
			ETA:        matches[4],
		}, true
	}
	return nil, false
}

// ParseDestination parses the destination filename from the output.
func ParseDestination(line string) (string, bool) {
	if matches := destinationRegex.FindStringSubmatch(line); len(matches) == 2 {
		return matches[1], true
	}
	if matches := alreadyDownloadedRegex.FindStringSubmatch(line); len(matches) == 2 {
		return matches[1], true
	}
	return "", false
}
