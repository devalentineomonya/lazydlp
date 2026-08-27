import {EventEmitter} from 'node:events';
import test from 'ava';
import {render} from 'ink';
import React from 'react';
import App from '../source/ui.js';
import {useMessageStore} from '../source/store/message-store.js';

const ESC = String.fromCharCode(27);
const ANSI = new RegExp(ESC + '\\[[0-9;?]*[a-zA-Z]', 'g');
const OSC = new RegExp(ESC + '\\][^\\u0007]*\\u0007', 'g');
const CLEAR_TERMINAL = new RegExp(ESC + '\\[2J', 'g');
const ROWS = 24;

const strip = (text: string) => text.replace(ANSI, '').replace(OSC, '');
const count = (haystack: string, needle: RegExp) =>
	(haystack.match(needle) || []).length;

const fakeStdout = () => {
	const writes: string[] = [];
	const stdout = new EventEmitter() as any;
	stdout.write = (chunk: string) => {
		writes.push(chunk);
		return true;
	};
	stdout.columns = 100;
	stdout.rows = ROWS;
	return {stdout, writes};
};

const fakeStdin = () => {
	const stdin = new EventEmitter() as any;
	stdin.isTTY = true;
	stdin.setEncoding = () => {};
	stdin.setRawMode = () => {};
	stdin.resume = () => {};
	stdin.pause = () => {};
	stdin.read = () => null;
	stdin.ref = () => {};
	stdin.unref = () => {};
	return stdin;
};

const delay = (ms: number) =>
	new Promise(resolve => {
		setTimeout(resolve, ms);
	});

/**
 * Drives a download-shaped workload: a batch of finished log lines followed by
 * one message that ticks rapidly, which is the shape that used to make Ink
 * repaint the whole terminal on every frame.
 */
const runDownload = async () => {
	useMessageStore.setState({history: []});

	const {stdout, writes} = fakeStdout();
	const instance = render(<App />, {
		stdout,
		stdin: fakeStdin(),
		exitOnCtrlC: false,
		patchConsole: false,
	});

	const store = useMessageStore.getState();
	for (let i = 0; i < 20; i++) store.addMessage('system', `settled line ${i}`);

	const id = store.addTemporaryMessage('yt-dlp', 'Extracting info...', true);
	for (let tick = 1; tick <= 20; tick++) {
		store.updateMessage(id, `Progress: ${tick * 5}%`, true);
		await delay(20);
	}

	store.updateMessage(id, 'Progress: done', false);
	await delay(200);
	instance.unmount();

	const raw = writes.join('');
	const live = writes.filter(chunk => !/Welcome back/.test(strip(chunk)));

	return {
		raw,
		printed: strip(raw),
		lastLiveFrame: strip(live[live.length - 1] ?? ''),
	};
};

let result: Awaited<ReturnType<typeof runDownload>>;

test.before(async () => {
	result = await runDownload();
});

test('never repaints the whole terminal while a download ticks', t => {
	// Ink falls back to `clearTerminal + full redraw` as soon as the live frame
	// is at least as tall as the terminal (ink/build/ink.js). At ~20 frames a
	// second that reads as the screen shaking.
	t.is(count(result.raw, CLEAR_TERMINAL), 0);
});

test('keeps the live frame shorter than the terminal', t => {
	t.true(result.lastLiveFrame.split('\n').length < ROWS);
});

test('moves finished messages out of the live frame', t => {
	t.false(/settled line 19/.test(result.lastLiveFrame));
});

test('prints each finished message exactly once', t => {
	// The hand-off from the live frame to <Static> must not duplicate output.
	t.is(count(result.printed, /settled line 19/g), 1);
	t.is(count(result.printed, /Progress: done/g), 1);
});

test('prints the welcome banner exactly once', t => {
	t.is(count(result.printed, /Welcome back/g), 1);
});
