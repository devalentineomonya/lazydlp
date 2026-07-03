import {spawn, execSync} from 'node:child_process';
import fs from 'node:fs';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import {getDlpPath, findPython, resetDlpCache} from '../utils/yt-dlp-utils.js';
import {resetYtDlpVersionCache} from '../utils/version.js';
import {Config} from '../utils/config.js';

interface UseYtDlpProps {
	config: Config;
	addMessage: (type: 'user' | 'system' | 'error' | 'yt-dlp', text: string) => void;
	updateMessage: (id: string, text: string, isPending?: boolean) => void;
	addTemporaryMessage: (type: 'user' | 'system' | 'error' | 'yt-dlp', text: string, isPending?: boolean) => string;
	setIsDownloading: (state: boolean) => void;
	addRecentDownload: (url: string, title?: string, filepath?: string) => void;
	setPostDownloadPrompt: (prompt: {title?: string; filepath: string} | null) => void;
	setPromptOptionIndex: (index: number) => void;
	activeHandles: React.MutableRefObject<{kill: () => void}[]>;
	updateSetting: <K extends keyof Config['settings']>(key: K, value: Config['settings'][K]) => void;
}

export function useYtDlp({
	config,
	addMessage,
	updateMessage,
	addTemporaryMessage,
	setIsDownloading,
	addRecentDownload,
	setPostDownloadPrompt,
	setPromptOptionIndex,
	activeHandles,
	updateSetting,
}: UseYtDlpProps) {
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

		const currentLogId = addTemporaryMessage('system', 'Starting pip install...', true);

		const fallbackToDirectDownload = (logId: string) => {
			const platform = os.platform();
			let filename = 'yt-dlp';
			if (platform === 'win32') filename = 'yt-dlp.exe';
			else if (platform === 'darwin') filename = 'yt-dlp_macos';
			else if (platform === 'linux') filename = 'yt-dlp_linux';

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

			const download = (urlStr: string) => {
				const req = https
					.get(urlStr, response => {
						if (response.statusCode === 301 || response.statusCode === 302) {
							return download(response.headers.location!);
						}
						if (response.statusCode !== 200) {
							addMessage(
								'error',
								`Download failed with status ${response.statusCode}`,
							);
							setIsDownloading(false);
							updateMessage(logId, 'Download failed.', false);
							return;
						}

						const total = parseInt(response.headers['content-length'] || '0', 10);
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
						fs.unlink(destPath, () => {});
						setIsDownloading(false);
						updateMessage(logId, 'Download failed.', false);
						addMessage('error', `Download error: ${err.message}`);
					});
				activeHandles.current.push({kill: () => req.destroy()});
			};

			download(url);
		};

		const pyCmd = await findPython();
		if (!pyCmd) {
			updateMessage(currentLogId, 'No python executable found. Falling back to direct download...', true);
			fallbackToDirectDownload(currentLogId);
			return;
		}

		const pip = spawn(pyCmd, ['-m', 'pip', 'install', '--user', '-U', 'yt-dlp']);
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
				updateMessage(currentLogId, `pip error: ${text.split('\n').pop()}`, true);
			}
		});

		pip.on('close', code => {
			if (code === 0) {
				resetYtDlpVersionCache();
				resetDlpCache();
				setIsDownloading(false);
				updateMessage(currentLogId, 'yt-dlp successfully installed via pip!', false);
				autoConfigureSystemDefaults();
			} else {
				updateMessage(currentLogId, 'pip install failed, falling back to direct download...', true);
				fallbackToDirectDownload(currentLogId);
			}
		});

		pip.on('error', () => {
			updateMessage(currentLogId, 'pip execution failed, falling back to direct download...', true);
			fallbackToDirectDownload(currentLogId);
		});
	};

	const autoConfigureSystemDefaults = () => {
		try {
			// Auto-detect reliable JS runtime (Node -> Deno)
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

			// Auto-detect media player (mpv -> vlc)
			if (!config.settings.defaultApp || config.settings.defaultApp === 'system default') {
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

	const handleDownload = async (
		url: string,
		customArgs: string[] = [],
	) => {
		const dlpCmd = await getDlpPath();
		if (!dlpCmd) {
			addMessage(
				'error',
				'yt-dlp is not installed. Please run /configure to download and set it up.',
			);
			return;
		}

		setIsDownloading(true);
		addMessage('system', `Starting download for: ${url}`);

		const args = [...dlpCmd.args, '-P', config.downloadDir];

		const isAudioOverride = customArgs.includes('--audio');
		const isVideoOverride = customArgs.includes('--video');
		const cleanArgs = customArgs.filter(a => a !== '--audio' && a !== '--video');

		const downloadType = isAudioOverride ? 'audio' : (isVideoOverride ? 'video' : config.settings.downloadType);

		// If the user manually provided format sorting/presets, skip our default formatting
		const hasFormatOverride = cleanArgs.includes('-f') || cleanArgs.includes('--format') || cleanArgs.includes('-S') || cleanArgs.includes('--format-sort') || cleanArgs.includes('-t') || cleanArgs.includes('--preset-alias');

		if (!hasFormatOverride) {
			if (downloadType === 'audio') {
				args.push('-x', '--audio-format', config.settings.audioFormat);
			} else {
				const sortArgs = [];
				if (config.settings.resolution !== 'best') {
					sortArgs.push(`res:${config.settings.resolution.replace('p', '')}`);
				}
				sortArgs.push(`ext:mp4:m4a`);
				args.push('-S', sortArgs.join(','));
			}
		}

		if (config.settings.playlists) {
			args.push('--yes-playlist');
		} else {
			args.push('--no-playlist');
		}

		if (config.settings.subtitles) {
			args.push('--write-auto-sub', '--write-sub', '--embed-subs');
		}

		if (config.settings.jsRuntime !== 'default') {
			args.push('--js-runtimes', config.settings.jsRuntime);
		}

		if (config.settings.cookiesFromBrowser) {
			args.push('--cookies-from-browser', config.settings.cookiesFromBrowser);
		}

		if (config.settings.antiBanSleep) {
			args.push('-t', 'sleep');
		}

		args.push(...cleanArgs);
		args.push(url);

		const ytDlp = spawn(dlpCmd.cmd, args, {
			cwd: config.downloadDir,
		});
		activeHandles.current.push(ytDlp);
		const currentLogId = addTemporaryMessage(
			'yt-dlp',
			'Extracting video info...',
			true,
		);
		let outputBuffer = '';
		let lastUpdate = 0;
		let lastDisplay = '';
		let downloadedFilepath: string | undefined;

		let videoTitle: string | undefined;
		const titleProcess = spawn(dlpCmd.cmd, [
			...dlpCmd.args,
			'--print',
			'title',
			url,
		]);
		activeHandles.current.push(titleProcess);
		titleProcess.stdout.on('data', data => {
			const output = data.toString().trim();
			if (output && !output.startsWith('WARNING')) {
				const lines = output.split('\n');
				videoTitle = lines[lines.length - 1];
			}
		});

		const updateLastOutput = (chunk: string, forceUpdate = false) => {
			outputBuffer += chunk;

			const now = Date.now();
			if (!forceUpdate && now - lastUpdate < 100) {
				return;
			}
			lastUpdate = now;

			const rawLines = outputBuffer.split(/[\n]/);
			let displayLines: string[] = [];

			for (const line of rawLines) {
				const parts = line.split('\r');
				const actualLine = parts[parts.length - 1];
				if (actualLine && actualLine.trim()) {
					const lineStr = actualLine.trim();
					displayLines.push(lineStr);

					const destMatch = lineStr.match(/\[download\] Destination: (.+)/);
					if (destMatch && destMatch[1]) downloadedFilepath = destMatch[1];
					const mergeMatch = lineStr.match(/\[Merger\] Merging formats into "([^"]+)"/);
					if (mergeMatch && mergeMatch[1]) downloadedFilepath = mergeMatch[1];
					const alreadyMatch = lineStr.match(/\[download\] (.*) has already been downloaded/);
					if (alreadyMatch && alreadyMatch[1]) downloadedFilepath = alreadyMatch[1];
				}
			}

			displayLines = displayLines.slice(-30);
			let finalDisplay = displayLines.join('\n');

			const lastStr = displayLines[displayLines.length - 1] || '';
			const progressMatch = lastStr.match(/\[download\]\s+([\d\.]+)%/);
			if (progressMatch) {
				const percent = parseFloat(progressMatch[1]!);
				const barWidth = 30;
				const filled = Math.round((percent / 100) * barWidth);
				const bar =
					'█'.repeat(Math.max(0, filled)) +
					'░'.repeat(Math.max(0, barWidth - filled));

				const etaMatch = lastStr.match(/ETA\s+([\d:]+)/);
				const speedMatch = lastStr.match(/at\s+([\d\.\w\/]+)/);
				const eta = etaMatch ? etaMatch[1] : '--:--';
				const speed = speedMatch ? speedMatch[1] : '--';

				finalDisplay += `\n\nProgress: [${bar}] ${percent}% | Speed: ${speed} | ETA: ${eta}`;
			}

			const newDisplay = finalDisplay.trim();
			if (newDisplay !== lastDisplay) {
				updateMessage(currentLogId, newDisplay, true);
				lastDisplay = newDisplay;
			}
		};

		ytDlp.stdout.on('data', data => {
			updateLastOutput(data.toString());
		});

		ytDlp.stderr.on('data', data => {
			updateLastOutput(data.toString());
		});

		ytDlp.on('close', code => {
			updateLastOutput('', true);
			setIsDownloading(false);
			if (code === 0) {
				updateMessage(currentLogId, `${lastDisplay}\n\nDownload finished successfully.`, false);
				addMessage(
					'system',
					`Download completed successfully to ${config.downloadDir}.`,
				);
				let finalFilepath = downloadedFilepath;
				if (finalFilepath && !path.isAbsolute(finalFilepath)) {
					finalFilepath = path.resolve(config.downloadDir, finalFilepath);
				}
				addRecentDownload(url, videoTitle, finalFilepath);
				
				if (finalFilepath && fs.existsSync(finalFilepath)) {
					setPostDownloadPrompt({title: videoTitle, filepath: finalFilepath});
					setPromptOptionIndex(0);
				}
			} else {
				updateMessage(currentLogId, `${lastDisplay}\n\nDownload failed.`, false);
				addMessage('error', `yt-dlp exited with code ${code}`);
			}
		});

		ytDlp.on('error', err => {
			setIsDownloading(false);
			addMessage(
				'error',
				`Failed to start yt-dlp: ${err.message}. Is yt-dlp installed and in your PATH?`,
			);
		});
	};

	return {handleConfigure, handleUpdate, handleDownload};
}
