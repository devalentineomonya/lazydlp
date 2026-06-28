import { Box, Text, useInput } from 'ink';
import React, { useState } from 'react';
import { theme } from '../utils/theme.js';
import { getYtDlpVersion } from '../utils/version.js';

export default function HelpMenu() {
	const [activeTab, setActiveTab] = useState(0);
	const tabs = ['general', 'commands', 'shortcuts'];

	useInput((_, key) => {
		if (key.leftArrow) {
			setActiveTab(prev => Math.max(0, prev - 1));
		} else if (key.rightArrow || key.tab) {
			setActiveTab(prev => Math.min(tabs.length - 1, prev + 1));
		}
	});

	return (
		<Box flexDirection="column" paddingY={1}>
			<Box flexDirection="row" marginBottom={1}>
				<Text color={theme.link} bold>Lazydlp</Text>

				{tabs.map((tab, index) => {
					const isActive = index === activeTab;
					return (
						<Box key={tab} marginX={index === 0 ? 2 : 0} marginRight={2}>
							{isActive ? (
								<Text color={theme.link} underline> {tab} </Text>
							) : (
								<Text color={theme.dim}>{tab}</Text>
							)}
						</Box>
					);
				})}
				<Text color={theme.dim}>  (←/→ to cycle)</Text>
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
						<Text bold>Available Commands</Text>
					</Box>
					<Box flexDirection="column" marginBottom={1}>
						<Box flexDirection="row"><Box width={20}><Text color={theme.link}>/download</Text></Box><Text color={theme.dim}>Download a video URL</Text></Box>
						<Box flexDirection="row"><Box width={20}><Text color={theme.link}>/setdir</Text></Box><Text color={theme.dim}>Change download directory</Text></Box>
						<Box flexDirection="row"><Box width={20}><Text color={theme.link}>/update</Text></Box><Text color={theme.dim}>Update lazydlp & yt-dlp</Text></Box>
						<Box flexDirection="row"><Box width={20}><Text color={theme.link}>/configure</Text></Box><Text color={theme.dim}>Run setup wizard</Text></Box>
						<Box flexDirection="row"><Box width={20}><Text color={theme.link}>/clear</Text></Box><Text color={theme.dim}>Clear message history</Text></Box>
						<Box flexDirection="row"><Box width={20}><Text color={theme.link}>/help</Text></Box><Text color={theme.dim}>Show this menu</Text></Box>
						<Box flexDirection="row"><Box width={20}><Text color={theme.link}>/exit</Text></Box><Text color={theme.dim}>Close application</Text></Box>
					</Box>
				</Box>
			)}

			{activeTab === 2 && (
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text bold>Keyboard Shortcuts</Text>
					</Box>
					<Box flexDirection="column" marginBottom={1}>
						<Box flexDirection="row"><Box width={20}><Text color={theme.link}>↑ / ↓</Text></Box><Text color={theme.dim}>Navigate suggestions</Text></Box>
						<Box flexDirection="row"><Box width={20}><Text color={theme.link}>← / →</Text></Box><Text color={theme.dim}>Switch tab view</Text></Box>
						<Box flexDirection="row"><Box width={20}><Text color={theme.link}>enter</Text></Box><Text color={theme.dim}>Execute command</Text></Box>
						<Box flexDirection="row"><Box width={20}><Text color={theme.link}>esc</Text></Box><Text color={theme.dim}>Close dialog / cancel</Text></Box>
						<Box flexDirection="row"><Box width={20}><Text color={theme.link}>ctrl + c</Text></Box><Text color={theme.dim}>Force exit</Text></Box>
					</Box>
				</Box>
			)}

			<Box marginBottom={1}>
				<Text>For more help: <Text color={theme.link}>https://github.com/yt-dlp/yt-dlp</Text></Text>
			</Box>
		</Box>
	);
}
