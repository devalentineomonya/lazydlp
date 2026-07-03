import {useApp, useInput} from 'ink';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import {useEffect, useState, useRef} from 'react';
import {useConfigStore} from '../store/config-store.js';
import {useMessageStore} from '../store/message-store.js';
import {useDownloadStore} from '../store/download-store.js';
import {resetYtDlpVersionCache} from '../utils/version.js';
import {COMMANDS} from '../utils/commands.js';

export function useAppState() {
	const {config, setDownloadDir, addRecentDownload} = useConfigStore();
	const {
		history,
		addMessage,
		addTemporaryMessage,
		updateMessage,
		clearMessages,
	} = useMessageStore();
	const {isDownloading, setIsDownloading} = useDownloadStore();

	const [input, setInput] = useState('');
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [ctrlCPressed, setCtrlCPressed] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [postDownloadPrompt, setPostDownloadPrompt] = useState<{title?: string; filepath: string} | null>(null);
	const [promptOptionIndex, setPromptOptionIndex] = useState(0);
	const [helpTab, setHelpTab] = useState(0);
	const [inputKey, setInputKey] = useState(0);
	const {exit} = useApp();

	const activeHandles = useRef<{kill: () => void}[]>([]);

	const quitApp = () => {
		activeHandles.current.forEach(handle => {
			try {
				handle.kill();
			} catch {}
		});
		exit();
		setTimeout(() => process.exit(0), 50);
	};
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

	// Auto configure if yt-dlp is not available
	useEffect(() => {
		let isMounted = true;
		getDlpPath().then(cmd => {
			if (!cmd && isMounted) {
				handleConfigure(false);
			}
		});
		return () => {
			isMounted = false;
		};
	}, []);

	// Listen for up/down arrow keys to navigate suggestions, and manual Ctrl+C
	useInput((inputChar, key) => {
		if (showHelp || showSettings) {
			if (key.escape) {
				if (showHelp) {
					setShowHelp(false);
					addMessage('system', 'Help dialog dismissed');
				}
				if (showSettings) {
					setShowSettings(false);
					addMessage('system', 'Settings saved');
				}
			}
			return;
		}

		if (postDownloadPrompt) {
			if (key.escape) {
				setPostDownloadPrompt(null);
				return;
			}
			if (key.leftArrow) {
				setPromptOptionIndex(prev => Math.max(0, prev - 1));
			} else if (key.rightArrow) {
				setPromptOptionIndex(prev => Math.min(2, prev + 1));
			} else if (key.return) {
				const opts = ['open', 'location', 'delete'];
				const action = opts[promptOptionIndex];
				const filepath = postDownloadPrompt.filepath;
				if (action === 'open') {
					import('open').then(m => {
						if (config.settings.defaultApp) {
							m.default(filepath, {app: {name: config.settings.defaultApp}});
						} else {
							m.default(filepath);
						}
					});
				} else if (action === 'location') {
					import('open').then(m => m.default(path.dirname(filepath)));
				} else if (action === 'delete') {
					try {
						fs.unlinkSync(filepath);
						addMessage('system', `Deleted: ${filepath}`);
					} catch (e: any) {
						addMessage('error', `Failed to delete: ${e.message}`);
					}
				}
				setPostDownloadPrompt(null);
			}
			return;
		}

		if (inputChar === '?' && input.trim() === '') {
			setShowHelp(true);
			setHelpTab(2);
			return;
		}

		if (inputChar !== 'c' || !key.ctrl) {
			setCtrlCPressed(false);
		}

		if (inputChar === 'c' && key.ctrl) {
			if (ctrlCPressed) {
				quitApp();
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

	const findPython = async (): Promise<string | null> => {
		for (const cmd of ['python3', 'python', 'py']) {
			try {
				const works = await new Promise<boolean>(resolve => {
					const py = spawn(cmd, ['--version']);
					py.on('close', code => resolve(code === 0));
					py.on('error', () => resolve(false));
				});
				if (works) return cmd;
			} catch {}
		}
		return null;
	};

	let cachedDlpCmd: {cmd: string; args: string[]} | null | undefined =
		undefined;

	const getDlpPath = async (): Promise<{
		cmd: string;
		args: string[];
	} | null> => {
		if (cachedDlpCmd !== undefined) return cachedDlpCmd;

		return new Promise(resolve => {
			const sys = spawn('yt-dlp', ['--version']);

			sys.on('close', code => {
				if (code === 0) {
					cachedDlpCmd = {cmd: 'yt-dlp', args: []};
					resolve(cachedDlpCmd);
				} else {
					checkPythonModule();
				}
			});

			sys.on('error', () => {
				checkPythonModule();
			});

			async function checkPythonModule() {
				const pyCmd = await findPython();
				if (!pyCmd) {
					checkCustomPath();
					return;
				}
				const py = spawn(pyCmd, ['-m', 'yt_dlp', '--version']);
				py.on('close', code => {
					if (code === 0) {
						cachedDlpCmd = {cmd: pyCmd, args: ['-m', 'yt_dlp']};
						resolve(cachedDlpCmd);
					} else {
						checkCustomPath();
					}
				});
				py.on('error', () => {
					checkCustomPath();
				});
			}

			function checkCustomPath() {
				const customPath = path.join(
					os.homedir(),
					'.lazydlp',
					os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp',
				);
				if (fs.existsSync(customPath)) {
					findPython().then(pyCmd => {
						if (pyCmd) {
							const py = spawn(pyCmd, [customPath, '--version']);
							py.on('close', code => {
								if (code === 0) {
									cachedDlpCmd = {cmd: pyCmd, args: [customPath]};
									resolve(cachedDlpCmd);
								} else {
									cachedDlpCmd = {cmd: customPath, args: []};
									resolve(cachedDlpCmd);
								}
							});
							py.on('error', () => {
								cachedDlpCmd = {cmd: customPath, args: []};
								resolve(cachedDlpCmd);
							});
						} else {
							cachedDlpCmd = {cmd: customPath, args: []};
							resolve(cachedDlpCmd);
						}
					});
				} else {
					cachedDlpCmd = null;
					resolve(null);
				}
			}
		});
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
							cachedDlpCmd = undefined;
							setIsDownloading(false);
							updateMessage(
								logId,
								`yt-dlp successfully installed to ${destPath}`,
								false,
							);
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
				cachedDlpCmd = undefined;
				setIsDownloading(false);
				updateMessage(currentLogId, 'yt-dlp successfully installed via pip!', false);
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
		overrideType?: 'audio' | 'video',
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
		const downloadType = overrideType || config.settings.downloadType;

		if (downloadType === 'audio') {
			args.push('-x', '--audio-format', config.settings.audioFormat);
		} else if (config.settings.resolution !== 'best') {
			const height = config.settings.resolution.replace('p', '');
			args.push(
				'-f',
				`bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`,
			);
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
				updateMessage(currentLogId, 'Download finished successfully.', false);
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
				updateMessage(currentLogId, 'Download failed.', false);
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

	const isValidYouTubeUrl = (url: string) => {
		return /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*(youtube\.com|youtu\.be)\/.+/.test(
			url,
		);
	};

	const handleSubmit = (value: string) => {
		if (!value.trim() || isDownloading) return;

		let userInput = value;

		// Autocomplete to the currently selected match
		if (userInput.startsWith('/')) {
			if (
				suggestions.length > 0 &&
				selectedIndex >= 0 &&
				selectedIndex < suggestions.length
			) {
				const bestMatch = suggestions[selectedIndex]!;
				const needsArgs =
					bestMatch.name === '/download' || bestMatch.name === '/setdir';
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
				setHelpTab(0);
			} else if (cmd === '/clear') {
				clearMessages();
			} else if (cmd === '/download') {
				if (args.length === 0) {
					addMessage(
						'error',
						'Please provide a URL to download. Usage: /download <url> [--audio] [--video]',
					);
				} else {
					const url = args.filter(a => !a.startsWith('--'))[0];
					const isAudio = args.includes('--audio');
					const isVideo = args.includes('--video');
					if (url && isValidYouTubeUrl(url)) {
						handleDownload(
							url,
							isAudio ? 'audio' : isVideo ? 'video' : undefined,
						);
					} else {
						addMessage(
							'error',
							'Invalid YouTube URL. Please provide a valid youtube.com or youtu.be link.',
						);
					}
				}
			} else if (cmd === '/settings') {
				setShowSettings(true);
			} else if (cmd === '/configure') {
				handleConfigure(false);
			} else if (cmd === '/update') {
				handleUpdate();
			} else if (cmd === '/setdir') {
				if (args.length === 0) {
					addMessage(
						'error',
						`Current directory is: ${config.downloadDir}\nUsage: /setdir <path>`,
					);
				} else {
					const newDir = path.resolve(
						args.join(' ').replace(/^~/, os.homedir()),
					);
					if (fs.existsSync(newDir)) {
						setDownloadDir(newDir);
						addMessage('system', `Download directory updated to: ${newDir}`);
					} else {
						addMessage('error', `Directory does not exist: ${newDir}`);
					}
				}
			} else if (cmd === '/exit') {
				quitApp();
			} else {
				addMessage('error', `Unknown command: ${cmd}`);
			}
		} else {
			// If not a command, treat as URL directly
			if (isValidYouTubeUrl(userInput)) {
				handleDownload(userInput);
			} else {
				addMessage(
					'error',
					'Invalid YouTube URL. Please provide a valid youtube.com or youtu.be link.',
				);
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
		showSettings,
		setShowSettings,
		postDownloadPrompt,
		promptOptionIndex,
		helpTab,
		inputKey,
		suggestions,
		handleSubmit,
	};
}
