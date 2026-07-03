import {Box, Text, useInput} from 'ink';
import React, {useState} from 'react';
import {theme} from '../utils/theme.js';
import {useConfigStore} from '../store/config-store.js';
import fs from 'node:fs';
import ActionMenu from './action-menu.js';
import {handleFileAction, FileAction, FILE_ACTION_LABELS} from '../utils/media.js';

export default function RecentMenu({onExit}: {onExit: () => void}) {
	const {config, removeRecentDownload} = useConfigStore();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [actionPrompt, setActionPrompt] = useState<{title?: string; filepath: string; url: string; exists: boolean} | null>(null);
	const [actionIndex, setActionIndex] = useState(0);

	const recents = config.recentDownloads;

	useInput((_, key) => {
		if (actionPrompt) {
			if (key.escape) {
				setActionPrompt(null);
				return;
			}
			const actions: FileAction[] = actionPrompt.exists
				? ['open', 'location', 'delete', 'remove_log']
				: ['remove_log'];

			if (key.upArrow) {
				setActionIndex(prev => Math.max(0, prev - 1));
				return;
			} else if (key.downArrow) {
				setActionIndex(prev => Math.min(actions.length - 1, prev + 1));
				return;
			}

			if (key.return) {
				const action = actions[actionIndex];
				const filepath = actionPrompt.filepath;
				
				if (action === 'remove_log') {
					removeRecentDownload(actionPrompt.url);
				} else if (action && actionPrompt.exists) {
					handleFileAction(action as any, filepath, config.settings.defaultApp);
					if (action === 'delete') {
						removeRecentDownload(actionPrompt.url);
					}
				}
				setActionPrompt(null);
			}
			return;
		}

		if (key.escape) {
			onExit();
			return;
		}

		if (recents.length > 0) {
			if (key.upArrow) {
				setSelectedIndex(prev => Math.max(0, prev - 1));
			} else if (key.downArrow) {
				setSelectedIndex(prev => Math.min(recents.length - 1, prev + 1));
			} else if (key.return) {
				const selected = recents[selectedIndex];
				if (selected) {
					const exists = selected.filepath ? fs.existsSync(selected.filepath) : false;
					setActionPrompt({
						title: selected.title,
						filepath: selected.filepath || '',
						url: selected.url,
						exists,
					});
					setActionIndex(0);
				}
			}
		}
	});

	if (actionPrompt) {
		const actions: FileAction[] = actionPrompt.exists 
			? ['open', 'location', 'delete', 'remove_log']
			: ['remove_log'];
			
		return (
			<ActionMenu
				title={`Action for: ${actionPrompt.title || actionPrompt.filepath}`}
				options={actions.map(a => FILE_ACTION_LABELS[a])}
				selectedIndex={actionIndex}
			/>
		);
	}

	return (
		<Box flexDirection="column" paddingY={1}>
			<Box marginBottom={1}>
				<Text bold color={theme.text}>
					Recent Downloads
				</Text>
			</Box>

			{recents.length === 0 ? (
				<Text color={theme.dim}>No recent downloads.</Text>
			) : (
				<Box flexDirection="column" marginBottom={1}>
					{recents.map((recent, index) => {
						const isActive = index === selectedIndex;
						const exists = recent.filepath ? fs.existsSync(recent.filepath) : false;

						return (
							<Box key={index + recent.url}>
								<Box width={2}>
									<Text color={theme.link}>{isActive ? '>' : ' '}</Text>
								</Box>
								<Box flexDirection="column">
									<Text color={isActive ? theme.link : theme.text} wrap="truncate-end">
										{recent.title || 'Unknown Title'} {exists ? '' : <Text color={theme.error}>(Deleted)</Text>}
									</Text>
									<Text color={theme.dim} wrap="truncate-end">
										{recent.filepath || recent.url}
									</Text>
								</Box>
							</Box>
						);
					})}
				</Box>
			)}
		</Box>
	);
}
