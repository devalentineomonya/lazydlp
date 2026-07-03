export const COMMANDS = [
	{name: '/help', description: 'Show this help message'},
	{name: '/clear', description: 'Clear terminal history'},
	{name: '/download', description: 'Download video [url] [-t mp3|mp4|mkv]'},
	{name: '/configure', description: 'Download and setup yt-dlp'},
	{name: '/settings', description: 'Configure global yt-dlp download settings'},
	{name: '/update', description: 'Update lazydlp and yt-dlp'},
	{name: '/setdir', description: 'Set download directory [path]'},
	{
		name: '/recent',
		description: 'View and manage your recent downloads',
	},
	{
		name: '/exit',
		description: 'Exit Lazydlp',
	},
];

export const SHORTCUTS = [
	{key: '↑ / ↓', desc: 'Navigate suggestions / History'},
	{key: '← / →', desc: 'Switch tab view'},
	{key: 'enter', desc: 'Execute command'},
	{key: 'esc', desc: 'Close dialog / cancel'},
	{key: 'ctrl + c', desc: 'Force exit'},
];
