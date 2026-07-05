import {UseYtDlpProps} from './use-yt-dlp-types.js';
import {useYtDlpConfigure} from './use-yt-dlp-configure.js';
import {useYtDlpUpdate} from './use-yt-dlp-update.js';
import {useYtDlpDownload} from './use-yt-dlp-download.js';

export function useYtDlp(props: UseYtDlpProps) {
	const {handleConfigure, autoConfigureSystemDefaults} = useYtDlpConfigure(props);
	const {handleUpdate} = useYtDlpUpdate(props, handleConfigure);
	const {handleDownload} = useYtDlpDownload(props);

	return {
		handleConfigure,
		autoConfigureSystemDefaults,
		handleUpdate,
		handleDownload,
	};
}
