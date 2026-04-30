# Lazy-YTDLP

A professional yt-dlp TUI for lazy people, inspired by `ssh terminal.shop`.

## Features
- **Clean Aesthetic**: Transparent backgrounds, thin borders, orange highlights.
- **Queue Management**: Manage multiple downloads with concurrency control.
- **Live Progress**: Real-time progress bars, speed, and ETA.
- **Persistent History**: SQLite-backed history of all your downloads.
- **Log Viewer**: Stream yt-dlp output directly in the UI.
- **Customizable**: Edit download profiles and global settings.

## Prerequisites
- **Go 1.21+**
- **yt-dlp** (must be in your PATH)

## Build
```bash
./build.sh
```

## Run
```bash
./lazy-ytdlp
```

## Keybindings
- **F1**: Downloads Page
- **F2**: Queue Page
- **F3**: History Page
- **F4**: Settings Page
- **Ctrl+Enter**: Start download (in URL input)
- **Ctrl+Q**: Quit
