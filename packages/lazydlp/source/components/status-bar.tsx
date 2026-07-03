import {Box, Text} from 'ink';
import React from 'react';
import {theme} from '../utils/theme.js';

export default function StatusBar({
	ctrlCPressed,
	activeMenu,
}: {
	ctrlCPressed: boolean;
	activeMenu: 'help' | 'settings' | 'recent' | 'prompt' | null;
}) {
	let leftSide = (
		<Text color={ctrlCPressed ? theme.error : theme.dim}>
			{ctrlCPressed ? 'Press ctrl+c again to exit' : '? for shortcuts'}
		</Text>
	);

	if (activeMenu === 'recent') {
		leftSide = (
			<Text color={theme.text}>
				<Text color={theme.link}>↑/↓</Text> Navigate ·{' '}
				<Text color={theme.link}>enter</Text> Options/Confirm ·{' '}
				<Text color={theme.link}>esc</Text> Exit/Back
			</Text>
		);
	} else if (activeMenu === 'settings') {
		leftSide = (
			<Text color={theme.text}>
				<Text color={theme.link}>↑/↓</Text> Navigate ·{' '}
				<Text color={theme.link}>enter</Text> Edit ·{' '}
				<Text color={theme.link}>esc</Text> Exit
			</Text>
		);
	} else if (activeMenu === 'help') {
		leftSide = (
			<Text color={theme.text}>
				<Text color={theme.link}>←/→</Text> Change Tab ·{' '}
				<Text color={theme.link}>esc</Text> Exit
			</Text>
		);
	} else if (activeMenu === 'prompt') {
		leftSide = (
			<Text color={theme.text}>
				<Text color={theme.link}>↑/↓</Text> Navigate ·{' '}
				<Text color={theme.link}>1-3</Text> Quick Select ·{' '}
				<Text color={theme.link}>enter</Text> Confirm ·{' '}
				<Text color={theme.link}>esc</Text> Dismiss
			</Text>
		);
	}

	return (
		<Box
			flexDirection="row"
			justifyContent="space-between"
			marginTop={1}
			paddingX={1}
		>
			{leftSide}
			<Text color={theme.dim}>Ready · Type /help</Text>
		</Box>
	);
}
