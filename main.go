package main

import (
	"fmt"
	"os"

	"github.com/lazy-ytdlp/lazy-ytdlp/internal/config"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/downloader"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/history"
	"github.com/lazy-ytdlp/lazy-ytdlp/internal/ui"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error loading configuration: %v\n", err)
		os.Exit(1)
	}

	// Initialize history database
	db, err := history.NewDB()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error initializing history database: %v\n", err)
		os.Exit(1)
	}

	// Initialize downloader manager
	mgr := downloader.NewManager(cfg)

	// Initialize and run the application
	app := ui.NewApp(cfg, mgr, db)

	if err := app.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "Error running application: %v\n", err)
		os.Exit(1)
	}
}
