import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.resolve(__dirname, '../../package.json');

let version = '0.0.0';
try {
	const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	version = pkg.version;
} catch (error) {
	// Fallback if unable to read package.json
}

export const APP_VERSION = version;

let cachedYtDlpVersion: string | null = null;

export const getYtDlpVersion = (): string => {
	if (cachedYtDlpVersion !== null) return cachedYtDlpVersion;

	try {
		const sys = spawnSync('yt-dlp', ['--version']);
		if (sys.status === 0) {
			cachedYtDlpVersion = sys.stdout.toString().trim();
			return cachedYtDlpVersion;
		}
	} catch {}

	try {
		const customPath = path.join(
			os.homedir(),
			'.lazydlp',
			os.platform() === 'win32' ? 'yt-dlp.exe' : 'yt-dlp',
		);
		if (fs.existsSync(customPath)) {
			const sys = spawnSync(customPath, ['--version']);
			if (sys.status === 0) {
				cachedYtDlpVersion = sys.stdout.toString().trim();
				return cachedYtDlpVersion;
			}
		}
	} catch {}

	cachedYtDlpVersion = 'Not installed';
	return cachedYtDlpVersion;
};

export const resetYtDlpVersionCache = () => {
	cachedYtDlpVersion = null;
};
