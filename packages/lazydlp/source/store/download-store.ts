import { create } from 'zustand';

interface DownloadState {
    isDownloading: boolean;
    setIsDownloading: (val: boolean) => void;
}

export const useDownloadStore = create<DownloadState>((set) => ({
    isDownloading: false,
    setIsDownloading: (val) => set({ isDownloading: val })
}));
