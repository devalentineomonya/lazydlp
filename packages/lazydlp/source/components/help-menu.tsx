import {Box, Text, useInput} from 'ink';
import React, {useState, useEffect} from 'react';
import {theme} from '../utils/theme.js';
import {getYtDlpVersion} from '../utils/version.js';
import {COMMANDS, SHORTCUTS} from '../utils/commands.js';

export default function HelpMenu({initialTab = 0, onExit}: {initialTab?: number, onExit: () => void}) {
	const [activeTab, setActiveTab] = useState(initialTab);
	const [ytVersion, setYtVersion] = useState('Loading...');
	const tabs = ['general', 'commands', 'shortcuts'];

	useEffect(() => {
		getYtDlpVersion().then(setYtVersion);
	}, []);

	useInput((_, key) => {
		if (key.leftArrow) {
			setActiveTab(prev => Math.max(0, prev - 1));
		} else if (key.rightArrow || key.tab) {
			setActiveTab(prev => Math.min(tabs.length - 1, prev + 1));
		} else if (key.escape) {
			onExit();
		}
	});

	return (
		<Box flexDirection="column" paddingY={1}>
			<Box flexDirection="row" marginBottom={1}>
				<Text color={theme.link} bold>
					Lazydlp
				</Text>

				{tabs.map((tab, index) => {
					const isActive = index === activeTab;
					return (
						<Box key={tab} marginX={index === 0 ? 2 : 0} marginRight={2}>
							{isActive ? (
								<Text color={theme.link} underline>
									{' '}
									{tab}{' '}
								</Text>
							) : (
								<Text color={theme.dim}>{tab}</Text>
							)}
						</Box>
					);
				})}
				<Text color={theme.dim}> (←/→ to cycle)</Text>
			</Box>
			{activeTab === 0 && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text>
							Lazydlp configuration and existing settings. Use left/right arrows
							to navigate tabs.
						</Text>
					</Box>
					<Box flexDirection="row" marginBottom={1}>
						<Box flexDirection="column" width="50%">
							<Text bold>Current Directory</Text>
							<Text color={theme.dim}>~/Downloads</Text>
						</Box>
						<Box flexDirection="column" width="50%">
							<Text bold>yt-dlp version</Text>
							<Text color={theme.dim}>{ytVersion}</Text>
						</Box>
					</Box>
				</Box>
			)}

			{activeTab === 1 && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text bold>Available Commands</Text>
					</Box>
					<Box flexDirection="column" marginBottom={1}>
						{COMMANDS.map(cmd => (
							<Box flexDirection="row" key={cmd.name}>
								<Box width={20}>
									<Text color={theme.link}>{cmd.name}</Text>
								</Box>
								<Text color={theme.dim}>{cmd.description}</Text>
							</Box>
						))}
					</Box>
				</Box>
			)}

			{activeTab === 2 && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text bold>Keyboard Shortcuts</Text>
					</Box>
					<Box flexDirection="column" marginBottom={1}>
						{SHORTCUTS.map(shortcut => (
							<Box flexDirection="row" key={shortcut.key}>
								<Box width={20}>
									<Text color={theme.link}>{shortcut.key}</Text>
								</Box>
								<Text color={theme.dim}>{shortcut.desc}</Text>
							</Box>
						))}
					</Box>
				</Box>
			)}

			<Box marginBottom={1}>
				<Text>
					For more help:{' '}
					<Text color={theme.link}>https://github.com/yt-dlp/yt-dlp</Text>
				</Text>
			</Box>
		</Box>
	);
}
