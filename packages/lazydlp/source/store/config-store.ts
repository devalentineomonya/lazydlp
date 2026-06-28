import { create } from 'zustand';
import { Config, loadConfig, saveConfig } from '../utils/config.js';

interface ConfigState {
    config: Config;
    setDownloadDir: (dir: string) => void;
    addRecentDownload: (url: string) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
    config: loadConfig(),
    setDownloadDir: (dir) => set((state) => {
        const newConfig = { ...state.config, downloadDir: dir };
        saveConfig(newConfig);
        return { config: newConfig };
    }),
    addRecentDownload: (url) => set((state) => {
        const newRecents = [{ url, date: new Date().toISOString() }, ...state.config.recentDownloads.filter(r => r.url !== url)].slice(0, 10);
        const newConfig = { ...state.config, recentDownloads: newRecents };
        saveConfig(newConfig);
        return { config: newConfig };
    })
}));
