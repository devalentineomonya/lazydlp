import test from 'ava';
import {
	detectInstallSource,
	updateCommand,
} from '../source/utils/install-source.js';

test('detects a pnpm dlx run', t => {
	// The real path from a `pnpm dlx lazydlp` run.
	t.is(
		detectInstallSource(
			'/home/user/.local/share/pnpm/store/v11/links/@/lazydlp/0.0.12/abc123/node_modules/lazydlp/dist/app.js',
		),
		'transient',
	);
});

test('detects an npx run', t => {
	t.is(
		detectInstallSource(
			'/home/user/.npm/_npx/8f1b2c/node_modules/lazydlp/dist/app.js',
		),
		'transient',
	);
});

test('detects a bunx run', t => {
	t.is(
		detectInstallSource(
			'/home/user/.bun/install/cache/lazydlp@0.0.12/dist/app.js',
		),
		'transient',
	);
});

test('detects a global bun install', t => {
	t.is(
		detectInstallSource(
			'/home/user/.bun/install/global/node_modules/lazydlp/dist/app.js',
		),
		'bun',
	);
});

test('detects a global pnpm install', t => {
	t.is(
		detectInstallSource(
			'/home/user/.local/share/pnpm/global/5/node_modules/lazydlp/dist/app.js',
		),
		'pnpm',
	);
});

test('detects a pnpm project install', t => {
	t.is(
		detectInstallSource(
			'/srv/app/node_modules/.pnpm/lazydlp@0.0.12/node_modules/lazydlp/dist/app.js',
		),
		'pnpm',
	);
});

test('detects a global yarn install', t => {
	t.is(
		detectInstallSource(
			'/home/user/.config/yarn/global/node_modules/lazydlp/dist/app.js',
		),
		'yarn',
	);
});

test('falls back to npm', t => {
	t.is(detectInstallSource('/usr/lib/node_modules/lazydlp/dist/app.js'), 'npm');
});

test('handles windows separators', t => {
	t.is(
		detectInstallSource(
			'C:\\Users\\user\\AppData\\Roaming\\npm\\node_modules\\lazydlp\\dist\\app.js',
		),
		'npm',
	);
});

test('maps each source to its update command', t => {
	t.deepEqual(updateCommand('npm'), {
		cmd: 'npm',
		args: ['install', '-g', 'lazydlp@latest'],
	});
	t.deepEqual(updateCommand('pnpm'), {
		cmd: 'pnpm',
		args: ['add', '-g', 'lazydlp@latest'],
	});
	t.deepEqual(updateCommand('bun'), {
		cmd: 'bun',
		args: ['install', '-g', 'lazydlp@latest'],
	});
	t.deepEqual(updateCommand('yarn'), {
		cmd: 'yarn',
		args: ['global', 'add', 'lazydlp@latest'],
	});
});

test('offers no command for a one-off run', t => {
	t.is(updateCommand('transient'), null);
});
