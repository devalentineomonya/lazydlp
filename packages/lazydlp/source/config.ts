import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CONFIG_DIR = path.join(os.homedir(), '.lazydlp');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface Config {
    downloadDir: string;
    recentDownloads: { url: string; date: string }[];
}

const DEFAULT_CONFIG: Config = {
    downloadDir: process.cwd(),
    recentDownloads: []
};

export const loadConfig = (): Config => {
    try {
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
        }
        if (!fs.existsSync(CONFIG_FILE)) {
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
            return DEFAULT_CONFIG;
        }
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch (err) {
        return DEFAULT_CONFIG;
    }
};

export const saveConfig = (config: Config) => {
    try {
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
        }
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (err) {
        // Ignore save errors
    }
};
