import React from 'react';
import {Text, Box} from 'ink';
import { theme } from '../theme.js';

export default function Logo() {
	return (
		<Box flexDirection="column" alignItems="center" marginY={1}>
			<Text color={theme.link}>   ████████   </Text>
			<Text color={theme.link}> ██        ██ </Text>
			<Text color={theme.link}> ██ ▀▀  ▀▀ ██ </Text>
			<Text color={theme.link}>██████████████</Text>
			<Text color={theme.link}>████  ██  ████</Text>
			<Text color={theme.link}>  ██████████  </Text>
			<Text color={theme.link}>    ██████    </Text>
			<Text color={theme.link}>      ██      </Text>
		</Box>
	);
}
