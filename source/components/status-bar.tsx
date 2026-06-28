import React from 'react';
import {Box, Text} from 'ink';
import { theme } from '../theme.js';

type Props = {
	ctrlCPressed: boolean;
};

export default function StatusBar({ ctrlCPressed }: Props) {
	return (
		<Box flexDirection="row" justifyContent="space-between" marginTop={1} paddingX={1}>
			<Text color={ctrlCPressed ? theme.error : theme.dim}>
				{ctrlCPressed ? 'Press ctrl+c again to exit' : '? for shortcuts'}
			</Text>
			<Text color={theme.dim}>Ready · Type /help</Text>
		</Box>
	);
}
