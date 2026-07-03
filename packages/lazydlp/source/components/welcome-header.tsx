import {Box, Text} from 'ink';
import React, {useState, useEffect} from 'react';
import {theme} from '../utils/theme.js';
import {APP_VERSION} from '../utils/version.js';
import Logo from './logo.js';
import {useConfigStore} from '../store/config-store.js';
import path from 'node:path';

const makeLink = (text: string, url: string) => {
	return `\x1B]8;;${url}\x07${text}\x1B]8;;\x07`;
};

export default function WelcomeHeader() {
	const {config} = useConfigStore();
	const recents = config.recentDownloads.slice(0, 2);

	const [width, setWidth] = useState(process.stdout.columns || 80);

	useEffect(() => {
		const onResize = () => setWidth(process.stdout.columns);
		process.stdout.on('resize', onResize);
		return () => {
			process.stdout.off('resize', onResize);
		};
	}, []);

	if (width < 85) {
		return (
			<Box
				borderStyle="round"
				borderColor={theme.primary}
				paddingX={1}
				paddingY={1}
				flexDirection="column"
				alignItems="center"
				marginBottom={1}
			>
				<Text bold>Welcome back!</Text>
				<Logo />
				<Text color={theme.dim}>Lazydlp v{APP_VERSION}</Text>
				<Text color={theme.dim}>~{config.downloadDir}</Text>
			</Box>
		);
	}

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
				<Text color={theme.primary} bold>
					Tips for getting started
				</Text>
				<Text>
					Run <Text color={theme.secondary}>/help</Text> to see all commands
				</Text>
				<Box
					borderStyle="single"
					borderColor={theme.primary}
					borderTop={false}
					borderLeft={false}
					borderRight={false}
				/>
				<Box marginBottom={1} flexDirection="row" justifyContent="space-between">
					<Text bold color={theme.primary}>
						Recent activity
					</Text>
					{config.recentDownloads.length > 2 && (
						<Text color={theme.dim}>(Type /recent to see all)</Text>
					)}
				</Box>
				{recents.length > 0 ? (
					recents.map((recent, i) => (
						<Box key={i} flexDirection="column">
							<Text color={theme.text} wrap="truncate-end" bold>
								{recent.title || 'Unknown Title'}
							</Text>
							<Text color={theme.dim} wrap="truncate-end">
								{recent.url}
							</Text>
							{recent.filepath && (
								<Box flexDirection="row" marginTop={0}>
									<Text color={theme.link}>
										{makeLink('▶ Open', 'file://' + recent.filepath)}
									</Text>
									<Text>  </Text>
									<Text color={theme.link}>
										{makeLink('📂 Location', 'file://' + path.dirname(recent.filepath))}
									</Text>
								</Box>
							)}
							{i < recents.length - 1 && (
								<Box
									borderStyle="single"
									borderColor={theme.border}
									borderTop={false}
									borderLeft={false}
									borderRight={false}
									marginBottom={1}
								/>
							)}
						</Box>
					))
				) : (
					<Text color={theme.dim}>No recent downloads</Text>
				)}
			</Box>
		</Box>
	);
}
