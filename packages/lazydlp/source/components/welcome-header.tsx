import { Box, Text } from 'ink';
import React from 'react';
import { theme } from '../utils/theme.js';
import { APP_VERSION } from '../utils/version.js';
import Logo from './logo.js';
import { useConfigStore } from '../store/config-store.js';

export default function WelcomeHeader() {
	const { config } = useConfigStore();
	const recents = config.recentDownloads.slice(0, 3);

	return (
		<Box
			borderStyle="round"
			borderColor={theme.primary}
			paddingX={1}
			flexDirection="row"
			marginBottom={1}
			width={85}
		>
			<Box flexDirection="column" width="30%" alignItems="center">
				<Text bold>Welcome back!</Text>
				<Logo />
				<Text color={theme.dim}>v{APP_VERSION}</Text>
			</Box>
			<Box
				borderStyle="single"
				borderColor={theme.primary}
				borderTop={false}
				borderBottom={false}
				borderRight={false}
				marginX={1}
			/>
			<Box flexDirection="column" width="70%">
				<Text color={theme.primary} bold>Tips for getting started</Text>
				<Text>Run <Text color={theme.secondary}>/help</Text> to see all commands</Text>
				<Box
					borderStyle="single"
					borderColor={theme.primary}
					borderTop={false}
					borderLeft={false}
					borderRight={false}
				/>
				<Text color={theme.primary} bold>Recent activity</Text>
				{recents.length > 0 ? (
					recents.map((recent, i) => (
						<Text key={i} color={theme.dim} wrap="truncate-end">
							• {recent.url}
						</Text>
					))
				) : (
					<Text color={theme.dim}>No recent downloads</Text>
				)}
			</Box>
		</Box>
	);
}
