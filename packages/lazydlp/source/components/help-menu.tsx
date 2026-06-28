import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { theme } from '../theme.js';
import { APP_VERSION, getYtDlpVersion } from '../version.js';

export default function HelpMenu() {
	const [activeTab, setActiveTab] = useState(0);
	const tabs = ['general', 'options', 'extra'];

	useInput((_, key) => {
		if (key.leftArrow) {
			setActiveTab(prev => Math.max(0, prev - 1));
		} else if (key.rightArrow) {
			setActiveTab(prev => Math.min(tabs.length - 1, prev + 1));
		}
	});

	return (
		<Box flexDirection="column" paddingY={1}>
			<Box flexDirection="row" marginBottom={1}>
				<Text color={theme.link} bold>Lazydlp v{APP_VERSION}</Text>
				
				{tabs.map((tab, index) => {
					const isActive = index === activeTab;
					return (
						<Box key={tab} marginX={index === 0 ? 2 : 0} marginRight={2} paddingX={isActive ? 1 : 0}>
							{isActive ? (
								<Text backgroundColor={theme.link} color={theme.text}> {tab} </Text>
							) : (
								<Text color={theme.dim}>{tab}</Text>
							)}
						</Box>
					);
				})}
			</Box>

			<Box 
				borderStyle="single" 
				borderColor={theme.link} 
				borderTop={false} 
				borderLeft={false} 
				borderRight={false} 
				marginBottom={1}
			/>

			{activeTab === 0 && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text>
							Lazydlp configuration and existing settings. Use left/right arrows to navigate tabs.
						</Text>
					</Box>
					<Box flexDirection="row" marginBottom={1}>
						<Box flexDirection="column" width="50%">
							<Text bold>Current Directory</Text>
							<Text color={theme.dim}>~/Downloads</Text>
						</Box>
						<Box flexDirection="column" width="50%">
							<Text bold>yt-dlp version</Text>
							<Text color={theme.dim}>{getYtDlpVersion()}</Text>
						</Box>
					</Box>
				</Box>
			)}

			{activeTab === 1 && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text>Available commands to interact with lazydlp.</Text>
					</Box>
					<Box flexDirection="row" marginBottom={1}>
						<Box flexDirection="column" width="33%">
							<Text>/help <Text color={theme.dim}>show menus</Text></Text>
							<Text>/clear <Text color={theme.dim}>clear history</Text></Text>
							<Text>/exit <Text color={theme.dim}>close app</Text></Text>
						</Box>
						<Box flexDirection="column" width="33%">
							<Text>/download <Text color={theme.dim}>&lt;url&gt;</Text></Text>
							<Text>/setdir <Text color={theme.dim}>&lt;path&gt;</Text></Text>
						</Box>
						<Box flexDirection="column" width="33%">
							<Text>ctrl + c <Text color={theme.dim}>exit manually</Text></Text>
							<Text>esc <Text color={theme.dim}>cancel dialogs</Text></Text>
						</Box>
					</Box>
				</Box>
			)}

			{activeTab === 2 && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text>Extra arguments and advanced instructions for yt-dlp.</Text>
					</Box>
					<Box flexDirection="column" marginBottom={1}>
						<Text>• <Text color={theme.link}>Audio Only:</Text> Add <Text color={theme.dim}>--extract-audio</Text> to fetch mp3</Text>
						<Text>• <Text color={theme.link}>Format Selection:</Text> Add <Text color={theme.dim}>-f bestvideo+bestaudio</Text></Text>
						<Text>• <Text color={theme.link}>Subtitles:</Text> Add <Text color={theme.dim}>--write-subs</Text> for captions</Text>
					</Box>
				</Box>
			)}

			<Box marginBottom={1}>
				<Text>For more help: <Text color={theme.link}>https://github.com/yt-dlp/yt-dlp</Text></Text>
			</Box>
		</Box>
	);
}
