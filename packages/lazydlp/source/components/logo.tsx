import {Box, Text} from 'ink';
import React from 'react';
import {theme} from '../utils/theme.js';

export default function Logo() {
	return (
		<Box flexDirection="column" alignItems="center" marginY={1}>
			<Text color={theme.primaryBright}> ████████ </Text>
			<Text color={theme.primaryBright}> ██ ██ </Text>
			<Text color={theme.primaryBright}> ██ ▀▀ ▀▀ ██ </Text>
			<Text color={theme.primaryBright}>██████████████</Text>
			<Text color={theme.primaryBright}>████ ██ ████</Text>
			<Text color={theme.primaryBright}> ██████████ </Text>
			<Text color={theme.primaryBright}> ██████ </Text>
			<Text color={theme.primaryBright}> ██ </Text>
		</Box>
	);
}
