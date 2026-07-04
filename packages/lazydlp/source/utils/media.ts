import {spawn} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

export const playMedia = (filepath: string, defaultApp?: string) => {
	if (defaultApp) {
		import('open').then(m => m.default(filepath, {app: {name: defaultApp}}));
		return;
	}

	// Check for mpv
	const mpv = spawn('mpv', [filepath], {stdio: 'ignore'});
	mpv.on('error', () => {
		// Fallback to vlc
		const vlc = spawn('vlc', [filepath], {stdio: 'ignore'});
		vlc.on('error', () => {
			// Fallback to system open
			import('open').then(m => m.default(filepath));
		});
	});
};

export type FileAction = 'open' | 'location' | 'delete' | 'remove_log';

export const FILE_ACTION_LABELS: Record<FileAction, string> = {
	open: 'Open File',
	location: 'Open Location',
	delete: 'Delete File',
	remove_log: 'Remove from History',
};

export const handleFileAction = (
	action: FileAction,
	filepath: string,
	defaultApp?: string,
	onDeleteSuccess?: () => void,
	onDeleteError?: (err: Error) => void,
) => {
	if (action === 'open') {
		playMedia(filepath, defaultApp);
	} else if (action === 'location') {
		const platform = process.platform;
		if (platform === 'win32') {
			spawn('explorer.exe', ['/select,', filepath]);
		} else if (platform === 'darwin') {
			spawn('open', ['-R', filepath]);
		} else {
			// Linux: Try DBus first (highlights the file in most modern DEs)
			import('node:child_process').then(({exec, spawn}) => {
				exec(
					`dbus-send --print-reply --dest=org.freedesktop.FileManager1 /org/freedesktop/FileManager1 org.freedesktop.FileManager1.ShowItems array:string:"file://${filepath}" string:""`,
					err => {
						if (err) {
							// Fallback to explicit file managers if DBus fails
							const dir = path.dirname(filepath);
							const fileManagers = [
								'nautilus',
								'thunar',
								'dolphin',
								'pcmanfm',
								'caja',
								'nemo',
							];
							let found = false;

							const tryManager = (index: number) => {
								if (index >= fileManagers.length) {
									if (!found) import('open').then(m => m.default(dir));
									return;
								}
								const fm = fileManagers[index]!;
								exec(`command -v ${fm}`, errCheck => {
									if (!errCheck) {
										found = true;
										spawn(fm, [dir], {detached: true, stdio: 'ignore'}).unref();
									} else {
										tryManager(index + 1);
									}
								});
							};
							tryManager(0);
						}
					},
				);
			});
		}
	} else if (action === 'delete') {
		try {
			fs.unlinkSync(filepath);
			if (onDeleteSuccess) onDeleteSuccess();
		} catch (e: any) {
			if (onDeleteError) onDeleteError(e);
		}
	}
};
