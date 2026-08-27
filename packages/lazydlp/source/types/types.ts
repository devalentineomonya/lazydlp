export type Message = {
	id: string;
	type: 'user' | 'system' | 'error' | 'yt-dlp';
	text: string;
	isPending?: boolean;
	/**
	 * Bumped on every update. Drives the pending spinner's frame, so the
	 * animation costs no extra repaints of its own.
	 */
	revision?: number;
};
