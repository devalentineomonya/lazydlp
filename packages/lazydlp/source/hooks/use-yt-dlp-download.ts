import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getDlpPath, buildYtDlpArgs } from '../utils/yt-dlp-utils.js';
import {UseYtDlpProps} from './use-yt-dlp-types.js';

export function useYtDlpDownload({
	config,
	addMessage,
	updateMessage,
	addTemporaryMessage,
	setIsDownloading,
	addRecentDownload,
	setPostDownloadPrompt,
	setPromptOptionIndex,
	activeHandles,
}: UseYtDlpProps) {
	const handleDownload = async (url: string, customArgs: string[] = []) => {
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

		const args = buildYtDlpArgs(url, customArgs, config, dlpCmd.args);

		if (!fs.existsSync(config.downloadDir)) {
			fs.mkdirSync(config.downloadDir, {recursive: true});
		}

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
			let lastValidLine = '';

			for (const line of rawLines) {
				const parts = line.split('\r');
				const actualLine = parts[parts.length - 1];
				if (actualLine && actualLine.trim()) {
					const lineStr = actualLine.trim();
					lastValidLine = lineStr;

					const destMatch = lineStr.match(/\[download\] Destination: (.+)/);
					if (destMatch && destMatch[1]) downloadedFilepath = destMatch[1];
					const mergeMatch = lineStr.match(
						/\[Merger\] Merging formats into "([^"]+)"/,
					);
					if (mergeMatch && mergeMatch[1]) downloadedFilepath = mergeMatch[1];
					const alreadyMatch = lineStr.match(
						/\[download\] (.*) has already been downloaded/,
					);
					if (alreadyMatch && alreadyMatch[1])
						downloadedFilepath = alreadyMatch[1];
				}
			}

			const progressMatch = lastValidLine.match(/\[download\]\s+([\d\.]+)%/);
			let finalDisplay = lastValidLine;

			if (progressMatch) {
				const percent = parseFloat(progressMatch[1]!);
				const barWidth = 30;
				const filled = Math.round((percent / 100) * barWidth);
				const bar =
					'█'.repeat(Math.max(0, filled)) +
					'░'.repeat(Math.max(0, barWidth - filled));

				const etaMatch = lastValidLine.match(/ETA\s+([\d:]+)/);
				const speedMatch = lastValidLine.match(/at\s+([\d\.\w\/]+)/);
				const eta = etaMatch ? etaMatch[1] : '--:--';
				const speed = speedMatch ? speedMatch[1] : '--';

				finalDisplay = `Progress: [${bar}] ${percent}%\nSpeed: ${speed} | ETA: ${eta}`;
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
				updateMessage(
					currentLogId,
					`${lastDisplay}\n\nDownload finished successfully.`,
					false,
				);
				addMessage(
					'system',
					`Download completed successfully to ${config.downloadDir}.`,
				);
				let finalFilepath = downloadedFilepath;
				if (finalFilepath && !path.isAbsolute(finalFilepath)) {
					finalFilepath = path.resolve(config.downloadDir, finalFilepath);
				}
				addRecentDownload(url, videoTitle, finalFilepath);

				if (os.platform() === 'android') {
					const isDir = !finalFilepath || !fs.existsSync(finalFilepath);
					const scanTarget = isDir ? config.downloadDir : finalFilepath;

					const scannerArgs = isDir ? ['-r', scanTarget] : [scanTarget];
					const scanner = spawn('termux-media-scan', scannerArgs);

					scanner.on('error', () => {
						addMessage(
							'error',
							'Could not run termux-media-scan. If your video is missing from the Gallery, please run: pkg install termux-api',
						);
					});
				}

				if (finalFilepath && fs.existsSync(finalFilepath)) {
					setPostDownloadPrompt({title: videoTitle, filepath: finalFilepath});
					setPromptOptionIndex(0);
				}
			} else {
				updateMessage(
					currentLogId,
					`${lastDisplay}\n\nDownload failed.`,
					false,
				);
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

	return { handleDownload };
}
