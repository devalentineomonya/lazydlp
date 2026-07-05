import {Config} from '../utils/config.js';

export interface UseYtDlpProps {
	config: Config;
	addMessage: (
		type: 'user' | 'system' | 'error' | 'yt-dlp',
		text: string,
	) => void;
	updateMessage: (id: string, text: string, isPending?: boolean) => void;
	addTemporaryMessage: (
		type: 'user' | 'system' | 'error' | 'yt-dlp',
		text: string,
		isPending?: boolean,
	) => string;
	setIsDownloading: (state: boolean) => void;
	addRecentDownload: (url: string, title?: string, filepath?: string) => void;
	setPostDownloadPrompt: (
		prompt: {title?: string; filepath: string} | null,
	) => void;
	setPromptOptionIndex: (index: number) => void;
	activeHandles: React.MutableRefObject<{kill: () => void}[]>;
	updateSetting: <K extends keyof Config['settings']>(
		key: K,
		value: Config['settings'][K],
	) => void;
}
