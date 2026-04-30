package downloader

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os/exec"
	"strings"

	"github.com/lazy-ytdlp/lazy-ytdlp/internal/utils"
)

// RunJob executes a download job.
func RunJob(ctx context.Context, job *DownloadJob, logWriter io.Writer) error {
	ytDlpPath, err := utils.FindYtDlp()
	if err != nil {
		job.SetStatus(StatusFailed)
		job.SetError("yt-dlp not found in PATH")
		return err
	}

	args := BuildArgs(job.Profile, job.URL)
	cmd := exec.CommandContext(ctx, ytDlpPath, args...)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		job.SetStatus(StatusFailed)
		job.SetError(err.Error())
		return err
	}
	cmd.Stderr = cmd.Stdout // Merge stderr into stdout

	if err := cmd.Start(); err != nil {
		job.SetStatus(StatusFailed)
		job.SetError(err.Error())
		return err
	}

	job.SetStatus(StatusDownloading)

	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		line := scanner.Text()

		if logWriter != nil {
			fmt.Fprintln(logWriter, line)
		}

		// Try to parse destination
		if dest, ok := ParseDestination(line); ok {
			job.SetOutputPath(dest)
			// Use filename as title if not set
			if job.Title == "" {
				job.SetTitle(strings.TrimSuffix(dest, "."+strings.Split(dest, ".")[len(strings.Split(dest, "."))-1]))
			}
		}

		// Try to parse progress
		if info, ok := ParseProgress(line); ok {
			job.Update(info.Percentage, info.TotalSize, info.Speed, info.ETA)
		}
	}

	if err := cmd.Wait(); err != nil {
		if ctx.Err() == context.Canceled {
			job.SetStatus(StatusCancelled)
			return ctx.Err()
		}
		job.SetStatus(StatusFailed)
		job.SetError(err.Error())
		return err
	}

	job.SetStatus(StatusCompleted)
	job.Update(100, job.TotalSize, "0B/s", "00:00")
	return nil
}
