import {spawn, execSync} from 'node:child_process';
import fs from 'node:fs';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import {getDlpPath, findPython, resetDlpCache} from '../utils/yt-dlp-utils.js';
import {resetYtDlpVersionCache} from '../utils/version.js';
import {UseYtDlpProps} from './use-yt-dlp-types.js';

export function useYtDlpConfigure({
	config,
	addMessage,
	updateMessage,
	addTemporaryMessage,
	setIsDownloading,
	activeHandles,
	updateSetting,
}: UseYtDlpProps) {
	const autoConfigureSystemDefaults = () => {
		try {
			if (config.settings.jsRuntime === 'default') {
				const runtimes = ['node', 'deno'];
				for (const rt of runtimes) {
					try {
						execSync(`command -v ${rt}`, {stdio: 'ignore'});
						updateSetting('jsRuntime', rt);
						addMessage('system', `Auto-configured JS Runtime: ${rt}`);
						break;
					} catch {}
				}
			}

			if (
				!config.settings.defaultApp ||
				config.settings.defaultApp === 'system default'
			) {
				const players = ['mpv', 'vlc'];
				for (const p of players) {
					try {
						execSync(`command -v ${p}`, {stdio: 'ignore'});
						updateSetting('defaultApp', p);
						addMessage('system', `Auto-configured Media Player: ${p}`);
						break;
					} catch {}
				}
			}
		} catch {}
	};

	const handleConfigure = async (forceDownload = false) => {
		const existingCmd = await getDlpPath();
		if (existingCmd && !forceDownload) {
			addMessage(
				'system',
				`yt-dlp is already available via: ${
					existingCmd.cmd
				} ${existingCmd.args.join(' ')}. Use /update to force an update.`,
			);
			return;
		}

		setIsDownloading(true);
		addMessage('system', 'Configuring Lazydlp: Installing yt-dlp...');

		const currentLogId = addTemporaryMessage(
			'system',
			'Starting pip install...',
			true,
		);

		const fallbackToDirectDownload = (logId: string) => {
			const platform = os.platform();
			let filename = 'yt-dlp';
			if (platform === 'win32') filename = 'yt-dlp.exe';
			else if (platform === 'darwin') filename = 'yt-dlp_macos';
			else if (platform === 'linux') filename = 'yt-dlp_linux';

			if (
				platform === 'android' ||
				(platform === 'linux' && process.arch !== 'x64')
			) {
				addMessage(
					'error',
					'A standalone yt-dlp binary is not available for this architecture/OS. Please install Python (e.g. pkg install python) and try again.',
				);
				setIsDownloading(false);
				updateMessage(
					logId,
					'Configuration failed: Python is required.',
					false,
				);
				return;
			}

			const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${filename}`;
			const targetDir = path.join(os.homedir(), '.lazydlp');
			if (!fs.existsSync(targetDir)) {
				fs.mkdirSync(targetDir, {recursive: true});
			}

			const destPath = path.join(
				targetDir,
				platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp',
			);
			const file = fs.createWriteStream(destPath);
			updateMessage(logId, 'Connecting to GitHub releases...', true);

			// createWriteStream has already created destPath, so a failure here must
			// remove it again. Leaving a zero-byte file behind makes getDlpPath()
			// report yt-dlp as installed, which breaks every later download.
			const abortDownload = (reason: string) => {
				file.close(() => {
					fs.unlink(destPath, () => {});
				});
				setIsDownloading(false);
				updateMessage(logId, 'Download failed.', false);
				addMessage('error', reason);
			};

			const download = (urlStr: string) => {
				const req = https
					.get(urlStr, response => {
						if (response.statusCode === 301 || response.statusCode === 302) {
							return download(response.headers.location!);
						}
						if (response.statusCode !== 200) {
							abortDownload(
								`Download failed with status ${response.statusCode}`,
							);
							return;
						}

						const total = parseInt(
							response.headers['content-length'] || '0',
							10,
						);
						let downloaded = 0;
						let lastUpdate = 0;

						response.on('data', chunk => {
							downloaded += chunk.length;
							const now = Date.now();
							if (total > 0 && now - lastUpdate > 100) {
								lastUpdate = now;
								const percent = Math.round((downloaded / total) * 100);
								const barWidth = 30;
								const filled = Math.round((percent / 100) * barWidth);
								const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);

								updateMessage(
									logId,
									`Downloading yt-dlp: [${bar}] ${percent}%`,
									true,
								);
							}
						});

						response.pipe(file);

						file.on('finish', () => {
							file.close();
							if (platform !== 'win32') {
								fs.chmodSync(destPath, 0o755);
							}
							resetYtDlpVersionCache();
							resetDlpCache();
							setIsDownloading(false);
							updateMessage(
								logId,
								`yt-dlp successfully installed to ${destPath}`,
								false,
							);
							autoConfigureSystemDefaults();
						});
					})
					.on('error', err => {
						abortDownload(`Download error: ${err.message}`);
					});
				activeHandles.current.push({kill: () => req.destroy()});
			};

			download(url);
		};

		const startPipInstall = async () => {
			const pyCmd = await findPython();
			if (!pyCmd) {
				const platform = os.platform();
				if (
					platform === 'android' ||
					(platform === 'linux' && process.arch !== 'x64')
				) {
					addMessage(
						'error',
						'A standalone yt-dlp binary is not available for this architecture/OS. Please install Python (e.g. pkg install python) and try again.',
					);
					setIsDownloading(false);
					updateMessage(
						currentLogId,
						'Configuration failed: Python is required.',
						false,
					);
				} else {
					updateMessage(
						currentLogId,
						'No python executable found. Falling back to direct download...',
						true,
					);
					fallbackToDirectDownload(currentLogId);
				}
				return;
			}

			const pip = spawn(pyCmd, [
				'-m',
				'pip',
				'install',
				'--user',
				'-U',
				'yt-dlp',
			]);
			activeHandles.current.push(pip);

			pip.stdout.on('data', data => {
				const text = data.toString().trim();
				if (text) {
					updateMessage(currentLogId, `pip: ${text.split('\n').pop()}`, true);
				}
			});

			pip.stderr.on('data', data => {
				const text = data.toString().trim();
				if (text) {
					updateMessage(
						currentLogId,
						`pip error: ${text.split('\n').pop()}`,
						true,
					);
				}
			});

			pip.on('close', code => {
				if (code === 0) {
					resetYtDlpVersionCache();
					resetDlpCache();
					setIsDownloading(false);
					updateMessage(
						currentLogId,
						'yt-dlp successfully installed via pip!',
						false,
					);
					autoConfigureSystemDefaults();
				} else {
					updateMessage(
						currentLogId,
						'pip install failed, falling back to direct download...',
						true,
					);
					fallbackToDirectDownload(currentLogId);
				}
			});

			pip.on('error', () => {
				updateMessage(
					currentLogId,
					'pip execution failed, falling back to direct download...',
					true,
				);
				fallbackToDirectDownload(currentLogId);
			});
		};

		const platform = os.platform();
		const hasStandaloneBinary =
			platform === 'win32' ||
			platform === 'darwin' ||
			(platform === 'linux' && process.arch === 'x64');

		if (hasStandaloneBinary) {
			fallbackToDirectDownload(currentLogId);
		} else {
			startPipInstall();
		}
	};

	return {handleConfigure, autoConfigureSystemDefaults};
}
