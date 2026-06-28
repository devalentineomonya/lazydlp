import React from 'react';
import {Box, Text} from 'ink';
import { theme } from '../theme.js';
import { Message } from '../types.js';

type Props = {
	history: Message[];
};

export default function MessageHistory({ history }: Props) {
	return (
		<Box flexDirection="column" marginBottom={1}>
			{history.map(msg => (
				<Box key={msg.id} flexDirection="column" marginY={0} paddingY={0}>
					{msg.type === 'user' && (
						<Box paddingX={0}>
							<Text color={theme.dim}>❯ </Text>
							<Text>{msg.text}</Text>
						</Box>
					)}
					{msg.type === 'system' && (
						<Box paddingLeft={0}>
							<Text color={theme.dim}>└  </Text>
							<Text color={theme.success}>{msg.text}</Text>
						</Box>
					)}
					{msg.type === 'error' && (
						<Box paddingLeft={0}>
							<Text color={theme.dim}>└  </Text>
							<Text color={theme.error}>{msg.text}</Text>
						</Box>
					)}
					{msg.type === 'yt-dlp' && (
						<Box paddingLeft={0}>
							<Text color={theme.dim}>└  </Text>
							<Text dimColor>{msg.text}</Text>
						</Box>
					)}
				</Box>
			))}
		</Box>
	);
}
