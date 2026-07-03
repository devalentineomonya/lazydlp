export const isValidYouTubeUrl = (url: string) => {
	return /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*(youtube\.com|youtu\.be)\/.+/.test(
		url,
	);
};
