import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let cachedDlpCmd: {cmd: string; args: string[]} | null | undefined = undefined;

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
