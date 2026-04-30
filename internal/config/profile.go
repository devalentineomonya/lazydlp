package config

// DownloadProfile represents a set of yt-dlp options.
type DownloadProfile struct {
	Name             string   `json:"name"`
	Format           string   `json:"format"`
	OutputTemplate   string   `json:"output_template"`
	DownloadPath     string   `json:"download_path"`
	EmbedSubs        bool     `json:"embed_subs"`
	EmbedMetadata    bool     `json:"embed_metadata"`
	EmbedThumbnail   bool     `json:"embed_thumbnail"`
	WriteAutoSubs    bool     `json:"write_auto_subs"`
	SubLanguages     string   `json:"sub_languages"`
	AudioFormat      string   `json:"audio_format"`
	AudioQuality     string   `json:"audio_quality"`
	PreferFreeFormats bool     `json:"prefer_free_formats"`
	Proxy            string   `json:"proxy"`
	CookiesFile      string   `json:"cookies_file"`
	Aria2            bool     `json:"aria2"`
	AdditionalArgs   []string `json:"additional_args"`
}

// DefaultProfile returns a profile with sensible defaults.
func DefaultProfile() DownloadProfile {
	return DownloadProfile{
		Name:           "Default",
		Format:         "bestvideo+bestaudio/best",
		OutputTemplate: "%(title)s.%(ext)s",
		DownloadPath:   ".",
		EmbedSubs:      true,
		EmbedMetadata:  true,
		EmbedThumbnail: true,
	}
}
