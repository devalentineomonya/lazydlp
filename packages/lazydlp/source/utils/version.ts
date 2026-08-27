import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Walk up from the current file to find our own package.json. The path
// differs between the tsc build (dist/utils/version.js) and the bundled
// build (dist/app.js), so a fixed relative path cannot cover both.
const readOwnVersion = (): string => {
	let dir = __dirname;

	while (true) {
		try {
			const pkg = JSON.parse(
				fs.readFileSync(path.join(dir, 'package.json'), 'utf8'),
			);
			if (pkg.name === 'lazydlp' && typeof pkg.version === 'string') {
				return pkg.version;
			}
		} catch {
			// Keep walking up
		}

		const parent = path.dirname(dir);
		if (parent === dir) return '0.0.0';
		dir = parent;
	}
};

const version = readOwnVersion();

export const APP_VERSION = version;

let cachedYtDlpVersion: string | null = null;

export const getYtDlpVersion = async (): Promise<string> => {
	if (cachedYtDlpVersion !== null) return cachedYtDlpVersion;

	return new Promise(resolve => {
		const sys = spawn('yt-dlp', ['--version']);
		let out = '';
		sys.stdout.on('data', d => {
			out += d.toString();
		});
		sys.on('close', code => {
			if (code === 0 && out.trim()) {
				cachedYtDlpVersion = out.trim();
				resolve(cachedYtDlpVersion);
			} else {
				// Fallback to custom path
				const customPath = path.join(
					os.homedir(),
					'.lazydlp',
					os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp',
				);
				if (fs.existsSync(customPath)) {
					const cust = spawn(customPath, ['--version']);
					let cout = '';
					cust.stdout.on('data', d => {
						cout += d.toString();
					});
					cust.on('close', ccode => {
						if (ccode === 0 && cout.trim()) {
							cachedYtDlpVersion = cout.trim();
							resolve(cachedYtDlpVersion);
						} else {
							cachedYtDlpVersion = 'Not installed';
							resolve(cachedYtDlpVersion);
						}
					});
					cust.on('error', () => {
						cachedYtDlpVersion = 'Not installed';
						resolve(cachedYtDlpVersion);
					});
				} else {
					cachedYtDlpVersion = 'Not installed';
					resolve(cachedYtDlpVersion);
				}
			}
		});
		sys.on('error', () => {
			// Trigger the same fallback logic if yt-dlp is not in PATH
			sys.emit('close', 1);
		});
	});
};

export const resetYtDlpVersionCache = () => {
	cachedYtDlpVersion = null;
};
