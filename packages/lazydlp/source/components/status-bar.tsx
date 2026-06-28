import React from 'react';
import {Box, Text} from 'ink';
import { theme } from '../theme.js';

type Props = {
	ctrlCPressed: boolean;
	showHelp?: boolean;
};

export default function StatusBar({ ctrlCPressed, showHelp }: Props) {
	return (
		<Box flexDirection="row" justifyContent="space-between" marginTop={1} paddingX={1}>
			<Text color={ctrlCPressed ? theme.error : theme.dim}>
				{ctrlCPressed ? 'Press ctrl+c again to exit' : (showHelp ? 'esc to close' : '? for shortcuts')}
			</Text>
			<Text color={theme.dim}>Ready · Type /help</Text>
		</Box>
	);
}
