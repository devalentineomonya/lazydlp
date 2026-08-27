import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {detectInstallSource, updateCommand} from '../utils/install-source.js';
import {UseYtDlpProps} from './use-yt-dlp-types.js';

export function useYtDlpUpdate(
	{addMessage, activeHandles}: UseYtDlpProps,
	handleConfigure: (forceDownload?: boolean) => Promise<void>,
) {
	const handleUpdate = () => {
		addMessage('system', 'Updating lazydlp CLI and yt-dlp...');

		const source = detectInstallSource(fileURLToPath(import.meta.url));
		const command = updateCommand(source);

		if (!command) {
			addMessage(
				'system',
				'Running via npx/dlx, which already fetches the latest release each time — nothing to update.',
			);
			handleConfigure(true);
			return;
		}

		const printable = [command.cmd, ...command.args].join(' ');
		const pkgUpdate = spawn(command.cmd, command.args);
		activeHandles.current.push(pkgUpdate);

		pkgUpdate.on('close', code => {
			if (code === 0) {
				addMessage('system', 'lazydlp CLI updated to the latest version.');
			} else {
				addMessage('error', `Update failed. Try running: ${printable}`);
			}
			// Always force an update of yt-dlp
			handleConfigure(true);
		});

		pkgUpdate.on('error', err => {
			// Most often ENOENT: the manager that installed lazydlp is no longer on
			// PATH. Tell the user the command rather than failing silently.
			addMessage(
				'error',
				`Could not run ${command.cmd} (${err.message}). Update manually with: ${printable}`,
			);
			handleConfigure(true);
		});
	};

	return {handleUpdate};
}
