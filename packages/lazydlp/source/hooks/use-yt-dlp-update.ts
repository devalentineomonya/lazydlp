import {spawn} from 'node:child_process';
import {UseYtDlpProps} from './use-yt-dlp-types.js';

export function useYtDlpUpdate(
	{ addMessage, activeHandles }: UseYtDlpProps,
	handleConfigure: (forceDownload?: boolean) => Promise<void>
) {
	const handleUpdate = () => {
		addMessage('system', 'Updating lazydlp CLI and yt-dlp...');

		const pkgUpdate = spawn('bun', ['install', '-g', 'lazydlp@latest']);
		activeHandles.current.push(pkgUpdate);
		pkgUpdate.on('close', code => {
			if (code === 0) {
				addMessage('system', 'lazydlp CLI updated to the latest version.');
			} else {
				addMessage('error', 'Failed to update lazydlp CLI automatically.');
			}
			// Always force an update of yt-dlp
			handleConfigure(true);
		});

		pkgUpdate.on('error', err => {
			addMessage('error', `Update error: ${err.message}`);
			handleConfigure(true);
		});
	};

	return { handleUpdate };
}
