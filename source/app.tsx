import React, {useState, useEffect} from 'react';
import {Box, Text, useInput, useApp} from 'ink';
import { spawn } from 'node:child_process';
import { theme } from './theme.js';
import { Message } from './types.js';

import WelcomeHeader from './components/welcome-header.js';
import MessageHistory from './components/message-history.js';
import CommandInput from './components/command-input.js';
import StatusBar from './components/status-bar.js';
import HelpMenu from './components/help-menu.js';

export const COMMANDS = [
	{ name: '/help', description: 'Show this help message' },
	{ name: '/clear', description: 'Clear terminal history' },
	{ name: '/download', description: 'Download a video [url]' },
	{ name: '/setdir', description: 'Set download directory [path]' },
	{ name: '/exit', description: 'Exit Lazydlp' }
];

export default function App() {
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

	const handleDownload = (url: string) => {
		setIsDownloading(true);
		addMessage('system', `Starting download for: ${url}`);

		const ytDlp = spawn('yt-dlp', [url]);
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
				addMessage('system', `Download completed successfully.`);
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
			} else if (cmd === '/setdir') {
				addMessage('system', `Set dir logic not fully implemented yet. Provided: ${args.join(' ')}`);
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
