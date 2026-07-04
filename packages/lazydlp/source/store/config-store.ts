import {create} from 'zustand';
import {Config, loadConfig, saveConfig} from '../utils/config.js';

interface ConfigState {
	config: Config;
	setDownloadDir: (dir: string) => void;
	addRecentDownload: (url: string, title?: string, filepath?: string) => void;
	removeRecentDownload: (url: string) => void;
	updateSetting: <K extends keyof Config['settings']>(
		key: K,
		value: Config['settings'][K],
	) => void;
	addCommandHistory: (cmd: string) => void;
}

export const useConfigStore = create<ConfigState>(set => ({
	config: loadConfig(),
	setDownloadDir: dir =>
		set(state => {
			const newConfig = {...state.config, downloadDir: dir};
			saveConfig(newConfig);
			return {config: newConfig};
		}),
	addRecentDownload: (url, title, filepath) =>
		set(state => {
			const newRecents = [
				{url, title, filepath, date: new Date().toISOString()},
				...state.config.recentDownloads.filter(r => r.url !== url),
			].slice(0, 10);
			const newConfig = {...state.config, recentDownloads: newRecents};
			saveConfig(newConfig);
			return {config: newConfig};
		}),
	removeRecentDownload: url =>
		set(state => {
			const newRecents = state.config.recentDownloads.filter(
				r => r.url !== url,
			);
			const newConfig = {...state.config, recentDownloads: newRecents};
			saveConfig(newConfig);
			return {config: newConfig};
		}),
	updateSetting: (key, value) =>
		set(state => {
			const newConfig = {
				...state.config,
				settings: {
					...state.config.settings,
					[key]: value,
				},
			};
			saveConfig(newConfig);
			return {config: newConfig};
		}),
	addCommandHistory: cmd =>
		set(state => {
			if (!cmd.trim()) return state;
			const newHistory = [
				cmd,
				...state.config.commandHistory.filter(c => c !== cmd),
			].slice(0, 50);
			const newConfig = {...state.config, commandHistory: newHistory};
			saveConfig(newConfig);
			return {config: newConfig};
		}),
}));
