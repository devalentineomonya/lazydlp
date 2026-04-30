package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// AppConfig represents the main application configuration.
type AppConfig struct {
	Profiles       []DownloadProfile `json:"profiles"`
	DefaultProfile string            `json:"default_profile"`
	DownloadDir    string            `json:"download_dir"`
	HistoryLimit   int               `json:"history_limit"`
	MaxConcurrent  int               `json:"max_concurrent"`
}

// GetConfigPath returns the absolute path to the configuration file.
func GetConfigPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".config", "lazy-ytdlp", "config.json"), nil
}

// Load loads the configuration from disk.
func Load() (*AppConfig, error) {
	configPath, err := GetConfigPath()
	if err != nil {
		return nil, err
	}

	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		config := DefaultConfig()
		if err := config.Save(); err != nil {
			return nil, err
		}
		return config, nil
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, err
	}

	var config AppConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	return &config, nil
}

// Save saves the configuration to disk.
func (c *AppConfig) Save() error {
	configPath, err := GetConfigPath()
	if err != nil {
		return err
	}

	if err := os.MkdirAll(filepath.Dir(configPath), 0755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(configPath, data, 0644)
}

// DefaultConfig returns a configuration with sensible defaults.
func DefaultConfig() *AppConfig {
	home, _ := os.UserHomeDir()
	downloadDir := filepath.Join(home, "Downloads")

	return &AppConfig{
		Profiles: []DownloadProfile{
			DefaultProfile(),
		},
		DefaultProfile: "Default",
		DownloadDir:    downloadDir,
		HistoryLimit:   100,
		MaxConcurrent:  3,
	}
}

// GetProfile returns a profile by name.
func (c *AppConfig) GetProfile(name string) (DownloadProfile, error) {
	for _, p := range c.Profiles {
		if p.Name == name {
			return p, nil
		}
	}
	return DownloadProfile{}, fmt.Errorf("profile not found: %s", name)
}
