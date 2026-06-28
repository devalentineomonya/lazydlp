import React from 'react';
import {Text, Box} from 'ink';
import { theme } from '../theme.js';

export default function Logo() {
	return (
		<Box flexDirection="column" alignItems="center">
			<Box>
				<Text color={theme.highlight}>▶ </Text>
				<Text color={theme.link}>▼ </Text>
			</Box>
			<Text color={theme.success} bold>yt-dlp</Text>
		</Box>
	);
}
