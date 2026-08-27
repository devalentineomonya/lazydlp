import {Text} from 'ink';
import React from 'react';
import {theme} from '../utils/theme.js';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

type Props = {
	/** Advances one frame per step. */
	step: number;
};

/**
 * A spinner with no clock of its own.
 *
 * Ink repaints its whole live region on every render (log-update erases the
 * previous frame and rewrites it), so a spinner running on its own interval
 * repaints the progress bar, the input box and the status bar along with
 * itself — roughly twelve times a second, on top of whatever the download is
 * already emitting. Driving the frame from the work's own updates keeps the
 * animation but halves the repaint rate, and it now tracks real progress
 * rather than the passage of time.
 */
export default function Spinner({step}: Props) {
	const frame = FRAMES[Math.abs(step) % FRAMES.length];
	return <Text color={theme.dim}>{frame}</Text>;
}
