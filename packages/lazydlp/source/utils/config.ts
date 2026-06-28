import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { z } from 'zod';

const CONFIG_DIR = path.join(os.homedir(), '.lazydlp');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export const ConfigSchema = z.object({
    downloadDir: z.string(),
    recentDownloads: z.array(z.object({
        url: z.string(),
        date: z.string()
    }))
});

export type Config = z.infer<typeof ConfigSchema>;

const DEFAULT_CONFIG: Config = {
    downloadDir: path.join(os.homedir(), 'Downloads'),
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
        const parsed = JSON.parse(data);
        const result = ConfigSchema.safeParse({ ...DEFAULT_CONFIG, ...parsed });
        if (result.success) {
            return result.data;
        } else {
            console.error("Config validation failed:", result.error);
            return DEFAULT_CONFIG;
        }
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
