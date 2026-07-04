import {useApp, useInput} from 'ink';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {handleFileAction, FileAction} from '../utils/media.js';
import {useEffect, useState, useRef} from 'react';
import {useConfigStore} from '../store/config-store.js';
import {useMessageStore} from '../store/message-store.js';
import {useDownloadStore} from '../store/download-store.js';
import {useYtDlp} from './use-yt-dlp.js';
import {getDlpPath} from '../utils/yt-dlp-utils.js';
import {isValidYouTubeUrl} from '../utils/url-utils.js';
import {COMMANDS} from '../utils/commands.js';

export function useAppState() {
	const {
		config,
		setDownloadDir,
		addRecentDownload,
		addCommandHistory,
		updateSetting,
	} = useConfigStore();
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
	const [showRecent, setShowRecent] = useState(false);
	const [postDownloadPrompt, setPostDownloadPrompt] = useState<{
		title?: string;
		filepath: string;
	} | null>(null);
	const [promptOptionIndex, setPromptOptionIndex] = useState(0);
	const [helpTab, setHelpTab] = useState(0);
	const [inputKey, setInputKey] = useState(0);
	const [historyIndex, setHistoryIndex] = useState(-1);
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

	const {handleConfigure, handleUpdate, handleDownload} = useYtDlp({
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
	});

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
		if (showHelp || showSettings || showRecent) {
			// Let child components (HelpMenu, SettingsMenu, RecentMenu) handle their own input
			// so they can process nested escapes (e.g. going back from an option) properly.
			return;
		}

		if (postDownloadPrompt) {
			if (key.escape) {
				setPostDownloadPrompt(null);
				return;
			}
			const actions: FileAction[] = ['open', 'location', 'delete', 'close'];

			if (key.upArrow) {
				setPromptOptionIndex(prev => Math.max(0, prev - 1));
				return;
			} else if (key.downArrow) {
				setPromptOptionIndex(prev => Math.min(actions.length - 1, prev + 1));
				return;
			}

			let selectedIdx = promptOptionIndex;
			if (inputChar === '1') selectedIdx = 0;
			else if (inputChar === '2') selectedIdx = 1;
			else if (inputChar === '3') selectedIdx = 2;
			else if (inputChar === '4') selectedIdx = 3;

			if (key.return || (inputChar && ['1', '2', '3', '4'].includes(inputChar))) {
				const action = actions[selectedIdx];
				const filepath = postDownloadPrompt.filepath;
				if (action && action !== 'close') {
					handleFileAction(
						action,
						filepath,
						config.settings.defaultApp,
						() => addMessage('system', `Deleted ${path.basename(filepath)}`),
						err => addMessage('error', `Failed to delete file: ${err.message}`),
					);
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

		const isCommandMode = input.startsWith('/');
		const isTypingCommand = isCommandMode && !input.trim().includes(' ');

		if (isTypingCommand && !isDownloading) {
			if (suggestions.length > 0) {
				if (key.upArrow) {
					setSelectedIndex(prev => Math.max(0, prev - 1));
				} else if (key.downArrow) {
					setSelectedIndex(prev => Math.min(suggestions.length - 1, prev + 1));
				}
			}
		} else if (!isDownloading && !postDownloadPrompt) {
			// Command history cycling
			if (key.upArrow) {
				setHistoryIndex(prev => {
					const next = Math.min(config.commandHistory.length - 1, prev + 1);
					if (next >= 0) {
						setInput(config.commandHistory[next]!);
						// Reset cursor to end of text by forcing a key re-render
						setInputKey(k => k + 1);
					}
					return next;
				});
			} else if (key.downArrow) {
				setHistoryIndex(prev => {
					const next = Math.max(-1, prev - 1);
					if (next === -1) {
						setInput('');
						setInputKey(k => k + 1);
					} else {
						setInput(config.commandHistory[next]!);
						setInputKey(k => k + 1);
					}
					return next;
				});
			}
		}
	});

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
		addCommandHistory(userInput);
		setHistoryIndex(-1);
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
						'Please provide a URL to download. Usage: /download <url> [-t mp3|mp4|mkv]',
					);
				} else {
					const url = args.find(a => !a.startsWith('-'));
					const customArgs = args.filter(a => a !== url);

					if (url && isValidYouTubeUrl(url)) {
						handleDownload(url, customArgs);
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
			} else if (cmd === '/recent') {
				setShowRecent(true);
			} else {
				addMessage('error', `Unknown command: ${cmd}`);
			}
		} else {
			// If not a command, parse for flags
			const args = userInput.split(' ');
			const url = args.find(a => !a.startsWith('-'));
			const customArgs = args.filter(a => a !== url);

			if (url && isValidYouTubeUrl(url)) {
				handleDownload(url, customArgs);
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
		showRecent,
		setShowRecent,
		setShowHelp,
		addMessage,
		setHelpTab,
		postDownloadPrompt,
		promptOptionIndex,
		helpTab,
		inputKey,
		suggestions,
		handleSubmit,
		setHistoryIndex,
	};
}
