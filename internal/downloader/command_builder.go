package downloader

import (
	"path/filepath"

	"github.com/lazy-ytdlp/lazy-ytdlp/internal/config"
)

// BuildArgs constructs the command-line arguments for yt-dlp based on the profile and URL.
func BuildArgs(profile config.DownloadProfile, url string) []string {
	args := []string{
		"--newline",
		"--progress",
		"--progress-template", "download:[download] %(progress._percent_str)s of %(progress._total_bytes_estimate_str)s at %(progress._speed_str)s ETA %(progress._eta_str)s",
		"--no-colors",
		url,
	}

	// Format
	if profile.Format != "" {
		args = append(args, "-f", profile.Format)
	}

	// Output template and path
	outputPath := profile.OutputTemplate
	if profile.DownloadPath != "" {
		outputPath = filepath.Join(profile.DownloadPath, profile.OutputTemplate)
	}
	if outputPath != "" {
		args = append(args, "-o", outputPath)
	}

	// Subtitles
	if profile.EmbedSubs {
		args = append(args, "--embed-subs")
	}
	if profile.WriteAutoSubs {
		args = append(args, "--write-auto-subs")
	}
	if profile.SubLanguages != "" {
		args = append(args, "--sub-langs", profile.SubLanguages)
	}

	// Metadata and Thumbnail
	if profile.EmbedMetadata {
		args = append(args, "--embed-metadata")
	}
	if profile.EmbedThumbnail {
		args = append(args, "--embed-thumbnail")
	}

	// Audio specific
	if profile.AudioFormat != "" {
		args = append(args, "--extract-audio", "--audio-format", profile.AudioFormat)
		if profile.AudioQuality != "" {
			args = append(args, "--audio-quality", profile.AudioQuality)
		}
	}

	// Proxy
	if profile.Proxy != "" {
		args = append(args, "--proxy", profile.Proxy)
	}

	// Cookies
	if profile.CookiesFile != "" {
		args = append(args, "--cookies", profile.CookiesFile)
	}

	// Free formats
	if profile.PreferFreeFormats {
		args = append(args, "--prefer-free-formats")
	}

	// External downloader (aria2)
	if profile.Aria2 {
		args = append(args, "--downloader", "aria2c")
	}

	// Additional arguments
	if len(profile.AdditionalArgs) > 0 {
		args = append(args, profile.AdditionalArgs...)
	}

	return args
}
