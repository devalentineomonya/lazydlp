#!/usr/bin/env node
import React, {useState, useEffect} from 'react';
import {render, Box, Text, useInput, useApp} from 'ink';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import https from 'node:https';
import { theme } from './theme.js';
import { Message } from './types.js';
import { loadConfig, saveConfig, Config } from './config.js';

import WelcomeHeader from './components/welcome-header.js';
import MessageHistory from './components/message-history.js';
import CommandInput from './components/command-input.js';
import StatusBar from './components/status-bar.js';
import HelpMenu from './components/help-menu.js';

export const COMMANDS = [
	{ name: '/help', description: 'Show this help message' },
	{ name: '/clear', description: 'Clear terminal history' },
	{ name: '/download', description: 'Download a video [url]' },
	{ name: '/configure', description: 'Download and setup yt-dlp' },
	{ name: '/update', description: 'Update lazydlp and yt-dlp' },
	{ name: '/setdir', description: 'Set download directory [path]' },
	{ name: '/exit', description: 'Exit Lazydlp' }
];

export default function App() {
	const [config, setConfig] = useState<Config>(loadConfig());
	const [input, setInput] = useState('');
	const [history, setHistory] = useState<Message[]>([]);
	const [isDownloading, setIsDownloading] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [ctrlCPressed, setCtrlCPressed] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
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

	const addMessage = (type: Message['type'], text: string) => {
		setHistory(prev => [...prev, { id: Math.random().toString(), type, text }]);
	};

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
		const currentLogId = Math.random().toString();
		setHistory(prev => [...prev, { id: currentLogId, type: 'system', text: 'Connecting...' }]);

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
						
						setHistory(prev => prev.map(msg =>
							msg.id === currentLogId ? { ...msg, text: `Downloading yt-dlp: [${bar}] ${percent}%` } : msg
						));
					}
				});

				response.pipe(file);

				file.on('finish', () => {
					file.close();
					if (platform !== 'win32') {
						fs.chmodSync(destPath, 0o755);
					}
					setIsDownloading(false);
					setHistory(prev => prev.map(msg =>
						msg.id === currentLogId ? { ...msg, text: `yt-dlp successfully installed to ${destPath}` } : msg
					));
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
		let currentLogId = Math.random().toString();
		let outputBuffer = '';

		setHistory(prev => [...prev, { id: currentLogId, type: 'yt-dlp', text: '...' }]);

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

			setHistory(prev => prev.map(msg =>
				msg.id === currentLogId ? { ...msg, text: finalDisplay.trim() } : msg
			));
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
				const newRecents = [{ url, date: new Date().toISOString() }, ...config.recentDownloads.filter(r => r.url !== url)].slice(0, 10);
				const newConfig = { ...config, recentDownloads: newRecents };
				setConfig(newConfig);
				saveConfig(newConfig);
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

		let userInput = value.trim();

		// Autocomplete to the currently selected match
		if (userInput.startsWith('/')) {
			if (suggestions.length > 0 && selectedIndex >= 0 && selectedIndex < suggestions.length) {
				const bestMatch = suggestions[selectedIndex];
				const [, ...args] = userInput.split(' ');
				userInput = [bestMatch!.name, ...args].join(' ');
			}
		}

		setInput('');
		addMessage('user', userInput);

		if (userInput.startsWith('/')) {
			const [cmd, ...args] = userInput.split(' ');

			if (cmd === '/help') {
				setShowHelp(true);
			} else if (cmd === '/clear') {
				setHistory([]);
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
						const newConfig = { ...config, downloadDir: newDir };
						setConfig(newConfig);
						saveConfig(newConfig);
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

	return (
		<Box flexDirection="column" paddingX={1} paddingTop={1}>
			{history.length < 5 && <WelcomeHeader />}

			{history.length < 5 && (
				<Box marginBottom={1}>
					<Text color={theme.dim}>↑ Lazydlp now supports streaming downloads directly to this TUI</Text>
				</Box>
			)}

			<MessageHistory history={history} />

			{showHelp ? (
				<HelpMenu />
			) : (
				<CommandInput
					input={input}
					setInput={setInput}
					onSubmit={handleSubmit}
					isDownloading={isDownloading}
					suggestions={suggestions}
					selectedIndex={selectedIndex}
				/>
			)}

			<StatusBar ctrlCPressed={ctrlCPressed} />
		</Box>
	);
}

render(<App />, { exitOnCtrlC: false });
