export const isValidYouTubeUrl = (url: string) => {
	return /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*(youtube\.com|youtu\.be)\/.+/.test(
		url,
	);
};

/**
 * Pulls the download URL out of a raw argument list, leaving everything else to
 * be forwarded to yt-dlp. Picking the URL by shape rather than by "first token
 * that isn't a flag" is what lets flags precede it, as in `-t mp3 <url>`.
 */
export const splitUrlAndArgs = (
	args: string[],
): {url?: string; customArgs: string[]} => {
	const urlIndex = args.findIndex(arg => isValidYouTubeUrl(arg));

	if (urlIndex === -1) {
		return {customArgs: args};
	}

	return {
		url: args[urlIndex]!,
		customArgs: args.filter((_, index) => index !== urlIndex),
	};
};
