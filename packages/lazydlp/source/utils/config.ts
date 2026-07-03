import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {z} from 'zod';

const CONFIG_DIR = path.join(os.homedir(), '.lazydlp');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export const ConfigSchema = z.object({
	downloadDir: z.string(),
	recentDownloads: z.array(
		z.object({
			url: z.string(),
			date: z.string(),
			title: z.string().optional(),
			filepath: z.string().optional(),
		}),
	),
	settings: z.object({
		downloadType: z.enum(['video', 'audio']).default('video'),
		resolution: z.enum(['best', '1080p', '720p', '480p']).default('best'),
		audioFormat: z.enum(['best', 'mp3', 'm4a', 'wav']).default('best'),
		playlists: z.boolean().default(false),
		subtitles: z.boolean().default(false),
		jsRuntime: z.string().default('default'),
		defaultApp: z.string().optional(),
		cookiesFromBrowser: z.string().optional(),
		antiBanSleep: z.boolean().default(false),
	}),
	commandHistory: z.array(z.string()).default([]),
});

export type Config = z.infer<typeof ConfigSchema>;

const getDefaultDownloadDir = () => {
	if (os.platform() === 'android') {
		const termuxStorage = path.join(os.homedir(), 'storage');
		if (fs.existsSync(termuxStorage)) {
			return path.join(termuxStorage, 'downloads');
		}
	}
	return path.join(os.homedir(), 'Downloads');
};

const DEFAULT_CONFIG: Config = {
	downloadDir: getDefaultDownloadDir(),
	recentDownloads: [],
	settings: {
		downloadType: 'video',
		resolution: 'best',
		audioFormat: 'best',
		playlists: false,
		subtitles: false,
		jsRuntime: 'default',
		defaultApp: undefined,
		cookiesFromBrowser: undefined,
		antiBanSleep: false,
	},
	commandHistory: [],
};

export const loadConfig = (): Config => {
	try {
		if (!fs.existsSync(CONFIG_DIR)) {
			fs.mkdirSync(CONFIG_DIR, {recursive: true});
		}
		if (!fs.existsSync(CONFIG_FILE)) {
			fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
			return DEFAULT_CONFIG;
		}
		const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
		const parsed = JSON.parse(data);
		const result = ConfigSchema.safeParse({...DEFAULT_CONFIG, ...parsed});
		if (result.success) {
			return result.data;
		} else {
			console.error('Config validation failed:', result.error);
			return DEFAULT_CONFIG;
		}
	} catch (err) {
		return DEFAULT_CONFIG;
	}
};

export const saveConfig = (config: Config) => {
	try {
		if (!fs.existsSync(CONFIG_DIR)) {
			fs.mkdirSync(CONFIG_DIR, {recursive: true});
		}
		fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
	} catch (err) {
		// Ignore save errors
	}
};
