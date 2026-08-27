export type InstallSource = 'npm' | 'pnpm' | 'bun' | 'yarn' | 'transient';

export type UpdateCommand = {cmd: string; args: string[]};

/**
 * Works out how the running copy of lazydlp was installed by looking at where
 * it lives on disk. Each package manager puts global installs and one-off runs
 * (`npx`, `pnpm dlx`, `bunx`) in a directory it owns, so the path is the only
 * signal available once the process is already running.
 */
export const detectInstallSource = (modulePath: string): InstallSource => {
	const path = modulePath.replace(/\\/g, '/');

	// One-off runners fetch a fresh copy every time, so there is nothing on disk
	// for an update to change. Check these before the per-manager directories,
	// since some of them sit inside the manager's own tree.
	if (
		path.includes('/_npx/') ||
		path.includes('/pnpm/store/') ||
		path.includes('/.pnpm-store/') ||
		path.includes('/.bun/install/cache/')
	) {
		return 'transient';
	}

	if (path.includes('/.bun/install/global/')) return 'bun';
	if (path.includes('/pnpm/global/') || path.includes('/node_modules/.pnpm/')) {
		return 'pnpm';
	}
	if (path.includes('/yarn/global/') || path.includes('/.yarn/')) return 'yarn';

	return 'npm';
};

/**
 * The command that updates a global install for the given manager, or null when
 * there is nothing to update.
 */
export const updateCommand = (source: InstallSource): UpdateCommand | null => {
	switch (source) {
		case 'transient': {
			return null;
		}

		case 'bun': {
			return {cmd: 'bun', args: ['install', '-g', 'lazydlp@latest']};
		}

		case 'pnpm': {
			return {cmd: 'pnpm', args: ['add', '-g', 'lazydlp@latest']};
		}

		case 'yarn': {
			return {cmd: 'yarn', args: ['global', 'add', 'lazydlp@latest']};
		}

		default: {
			return {cmd: 'npm', args: ['install', '-g', 'lazydlp@latest']};
		}
	}
};
