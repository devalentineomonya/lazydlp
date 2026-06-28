import { useApp, useInput } from 'ink';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { useEffect, useState } from 'react';
import { useConfigStore } from '../store/config-store.js';
import { useMessageStore } from '../store/message-store.js';
import { useDownloadStore } from '../store/download-store.js';
import { resetYtDlpVersionCache } from '../utils/version.js';
import { COMMANDS } from '../utils/commands.js';

export function useAppState() {
	const { config, setDownloadDir, addRecentDownload } = useConfigStore();
	const { history, addMessage, addTemporaryMessage, updateMessage, clearMessages } = useMessageStore();
	const { isDownloading, setIsDownloading } = useDownloadStore();
	
	const [input, setInput] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [ctrlCPressed, setCtrlCPressed] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const [inputKey, setInputKey] = useState(0);
	const { exit } = useApp();

	// Filter suggestions dynamically based on input
	const isCommand = input.startsWith('/');
	const [cmdName] = input.split(' ');
	const suggestions = isCommand
		? COMMANDS.filter(c => c.name.startsWith(cmdName || ''))
		: [];

	// Reset selected index whenever the input text changes
	useEffect(() => {
		setSelectedIndex(0);
	}, [input]);

	// Listen for up/down arrow keys to navigate suggestions, and manual Ctrl+C
	useInput((inputChar, key) => {
		if (showHelp) {
			if (key.escape) {
				setShowHelp(false);
				addMessage('system', 'Help dialog dismissed');
			}
			return;
		}

		if (inputChar !== 'c' || !key.ctrl) {
			setCtrlCPressed(false);
		}

		if (inputChar === 'c' && key.ctrl) {
			if (ctrlCPressed) {
				exit();
			} else {
				setCtrlCPressed(true);
			}
			return;
		}

		if (suggestions.length > 0 && !isDownloading) {
			if (key.upArrow) {
				setSelectedIndex(prev => Math.max(0, prev - 1));
			} else if (key.downArrow) {
				setSelectedIndex(prev => Math.min(suggestions.length - 1, prev + 1));
			}
		}
	});

	const getDlpPath = () => {
		try {
			const sys = spawnSync('yt-dlp', ['--version']);
			if (sys.status === 0) return 'yt-dlp';
		} catch {}

		const customPath = path.join(os.homedir(), '.lazydlp', os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
		if (fs.existsSync(customPath)) return customPath;

		return null;
	};

	const handleConfigure = (forceDownload = false) => {
		const existingPath = getDlpPath();
		if (existingPath && !forceDownload) {
			addMessage('system', `yt-dlp is already installed at: ${existingPath}. Use /update to force an update.`);
			return;
		}

		setIsDownloading(true);
		addMessage('system', 'Configuring Lazydlp: Downloading yt-dlp...');

		const platform = os.platform();
		let filename = 'yt-dlp';
		if (platform === 'win32') filename = 'yt-dlp.exe';
		else if (platform === 'darwin') filename = 'yt-dlp_macos';
		else if (platform === 'linux') filename = 'yt-dlp_linux';

		const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${filename}`;
		const targetDir = path.join(os.homedir(), '.lazydlp');
		if (!fs.existsSync(targetDir)) {
			fs.mkdirSync(targetDir, { recursive: true });
		}

		const destPath = path.join(targetDir, platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
		const file = fs.createWriteStream(destPath);
		const currentLogId = addTemporaryMessage('system', 'Connecting...');

		const download = (urlStr: string) => {
			https.get(urlStr, (response) => {
				if (response.statusCode === 301 || response.statusCode === 302) {
					return download(response.headers.location!);
				}
				if (response.statusCode !== 200) {
					addMessage('error', `Download failed with status ${response.statusCode}`);
					setIsDownloading(false);
					return;
				}

				const total = parseInt(response.headers['content-length'] || '0', 10);
				let downloaded = 0;
				let lastUpdate = 0;

				response.on('data', (chunk) => {
					downloaded += chunk.length;
					const now = Date.now();
					if (total > 0 && now - lastUpdate > 100) {
						lastUpdate = now;
						const percent = Math.round((downloaded / total) * 100);
						const barWidth = 30;
						const filled = Math.round((percent / 100) * barWidth);
						const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);

						updateMessage(currentLogId, `Downloading yt-dlp: [${bar}] ${percent}%`);
					}
				});

				response.pipe(file);

				file.on('finish', () => {
					file.close();
					if (platform !== 'win32') {
						fs.chmodSync(destPath, 0o755);
					}
					resetYtDlpVersionCache();
					setIsDownloading(false);
					updateMessage(currentLogId, `yt-dlp successfully installed to ${destPath}`);
				});
			}).on('error', (err) => {
				fs.unlink(destPath, () => {});
				setIsDownloading(false);
				addMessage('error', `Download error: ${err.message}`);
			});
		};

		download(url);
	};

	const handleUpdate = () => {
		addMessage('system', 'Updating lazydlp CLI and yt-dlp...');

		const pkgUpdate = spawn('bun', ['install', '-g', 'lazydlp@latest']);
		pkgUpdate.on('close', (code) => {
			if (code === 0) {
				addMessage('system', 'lazydlp CLI updated to the latest version.');
			} else {
				addMessage('error', 'Failed to update lazydlp CLI automatically.');
			}
			// Always force an update of yt-dlp
			handleConfigure(true);
		});

		pkgUpdate.on('error', (err) => {
			addMessage('error', `Update error: ${err.message}`);
			handleConfigure(true);
		});
	};

	const handleDownload = (url: string) => {
		const dlpPath = getDlpPath();
		if (!dlpPath) {
			addMessage('error', 'yt-dlp is not installed. Please run /configure to download and set it up.');
			return;
		}

		setIsDownloading(true);
		addMessage('system', `Starting download for: ${url}`);

		const ytDlp = spawn(dlpPath, ['-P', config.downloadDir, url]);
		const currentLogId = addTemporaryMessage('yt-dlp', '...');
		let outputBuffer = '';

		const updateLastOutput = (chunk: string) => {
			outputBuffer += chunk;

			const rawLines = outputBuffer.split(/[\n]/);
			let displayLines: string[] = [];

			for (const line of rawLines) {
				const parts = line.split('\r');
				const actualLine = parts[parts.length - 1];
				if (actualLine && actualLine.trim()) {
					displayLines.push(actualLine.trim());
				}
			}

			displayLines = displayLines.slice(-6);
			let finalDisplay = displayLines.join('\n');

			const lastStr = displayLines[displayLines.length - 1] || '';
			const progressMatch = lastStr.match(/\[download\]\s+([\d\.]+)%/);
			if (progressMatch) {
				const percent = parseFloat(progressMatch[1]!);
				const barWidth = 30;
				const filled = Math.round((percent / 100) * barWidth);
				const bar = '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, barWidth - filled));

				const etaMatch = lastStr.match(/ETA\s+([\d:]+)/);
				const speedMatch = lastStr.match(/at\s+([\d\.\w\/]+)/);
				const eta = etaMatch ? etaMatch[1] : '--:--';
				const speed = speedMatch ? speedMatch[1] : '--';

				finalDisplay += `\n\nProgress: [${bar}] ${percent}% | Speed: ${speed} | ETA: ${eta}`;
			}

			updateMessage(currentLogId, finalDisplay.trim());
		};

		ytDlp.stdout.on('data', (data) => {
			updateLastOutput(data.toString());
		});

		ytDlp.stderr.on('data', (data) => {
			updateLastOutput(data.toString());
		});

		ytDlp.on('close', (code) => {
			setIsDownloading(false);
			if (code === 0) {
				addMessage('system', `Download completed successfully to ${config.downloadDir}.`);
				addRecentDownload(url);
			} else {
				addMessage('error', `yt-dlp exited with code ${code}`);
			}
		});

		ytDlp.on('error', (err) => {
			setIsDownloading(false);
			addMessage('error', `Failed to start yt-dlp: ${err.message}. Is yt-dlp installed and in your PATH?`);
		});
	};

	const isValidYouTubeUrl = (url: string) => {
		return /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*(youtube\.com|youtu\.be)\/.+/.test(url);
	};

	const handleSubmit = (value: string) => {
		if (!value.trim() || isDownloading) return;

		let userInput = value;

		// Autocomplete to the currently selected match
		if (userInput.startsWith('/')) {
			if (suggestions.length > 0 && selectedIndex >= 0 && selectedIndex < suggestions.length) {
				const bestMatch = suggestions[selectedIndex]!;
				const needsArgs = bestMatch.name === '/download' || bestMatch.name === '/setdir';
				const parts = userInput.trim().split(' ');
				const hasNoArgs = parts.length === 1;

				if (needsArgs && hasNoArgs && !userInput.endsWith(' ')) {
					setInput(bestMatch.name + ' ');
					setInputKey(prev => prev + 1);
					return;
				}

				const [, ...args] = userInput.trim().split(' ');
				userInput = [bestMatch.name, ...args].join(' ');
			}
		}

		userInput = userInput.trim();
		setInput('');
		addMessage('user', userInput);

		if (userInput.startsWith('/')) {
			const [cmd, ...args] = userInput.split(' ');

			if (cmd === '/help') {
				setShowHelp(true);
			} else if (cmd === '/clear') {
				clearMessages();
			} else if (cmd === '/download') {
				if (args.length === 0) {
					addMessage('error', 'Please provide a URL to download. Usage: /download <url>');
				} else {
					const url = args[0]!;
					if (isValidYouTubeUrl(url)) {
						handleDownload(url);
					} else {
						addMessage('error', 'Invalid YouTube URL. Please provide a valid youtube.com or youtu.be link.');
					}
				}
			} else if (cmd === '/configure') {
				handleConfigure(false);
			} else if (cmd === '/update') {
				handleUpdate();
			} else if (cmd === '/setdir') {
				if (args.length === 0) {
					addMessage('error', `Current directory is: ${config.downloadDir}\nUsage: /setdir <path>`);
				} else {
					const newDir = path.resolve(args.join(' ').replace(/^~/, os.homedir()));
					if (fs.existsSync(newDir)) {
						setDownloadDir(newDir);
						addMessage('system', `Download directory updated to: ${newDir}`);
					} else {
						addMessage('error', `Directory does not exist: ${newDir}`);
					}
				}
			} else if (cmd === '/exit') {
				exit();
			} else {
				addMessage('error', `Unknown command: ${cmd}`);
			}
		} else {
			// If not a command, treat as URL directly
			if (isValidYouTubeUrl(userInput)) {
				handleDownload(userInput);
			} else {
				addMessage('error', 'Invalid YouTube URL. Please provide a valid youtube.com or youtu.be link.');
			}
		}
	};

	return {
		input,
		setInput,
		history,
		isDownloading,
		selectedIndex,
		ctrlCPressed,
		showHelp,
		inputKey,
		suggestions,
		handleSubmit
	};
}
