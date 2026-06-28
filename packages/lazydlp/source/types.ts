export type Message = {
	id: string;
	type: 'user' | 'system' | 'error' | 'yt-dlp';
	text: string;
};
