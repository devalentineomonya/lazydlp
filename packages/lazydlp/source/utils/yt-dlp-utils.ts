import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let cachedDlpCmd: {cmd: string; args: string[]} | null | undefined = undefined;

import {Config} from './config.js';

export const buildYtDlpArgs = (
	url: string,
	customArgs: string[],
	config: Config,
	baseArgs: string[] = [],
): string[] => {
	const args = [...baseArgs, '-P', config.downloadDir];

	let cleanArgs = [...customArgs];

	const tIndex = cleanArgs.indexOf('-t');
	let customFormat = '';
	if (tIndex !== -1 && cleanArgs[tIndex + 1]) {
		customFormat = cleanArgs[tIndex + 1]!;
		cleanArgs.splice(tIndex, 2);
	}

	const isAudioOverride = cleanArgs.includes('--audio');
	const isVideoOverride = cleanArgs.includes('--video');
	cleanArgs = cleanArgs.filter(a => a !== '--audio' && a !== '--video');

	const hasFormatOverride =
		cleanArgs.includes('-f') ||
		cleanArgs.includes('--format') ||
		cleanArgs.includes('-S') ||
		cleanArgs.includes('--format-sort');

	if (!hasFormatOverride) {
		if (isAudioOverride) {
			args.push('-f', 'bestaudio/best', '-x');
		} else if (isVideoOverride) {
			args.push('-f', 'bestvideo+bestaudio/best');
		} else if (customFormat) {
			if (['mp3', 'm4a', 'wav'].includes(customFormat)) {
				args.push('-x', '--audio-format', customFormat);
			} else {
				args.push('-S', `ext:${customFormat}`);
			}
		} else {
			if (config.settings.downloadType === 'audio') {
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
		args.push(
			'--sleep-requests',
			'1',
			'--sleep-interval',
			'5',
			'--max-sleep-interval',
			'10',
		);
	}

	args.push(...cleanArgs);
	args.push(url);

	return args;
};

export const findPython = async (): Promise<string | null> => {
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

export const getDlpPath = async (): Promise<{
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

export const resetDlpCache = () => {
	cachedDlpCmd = undefined;
};
