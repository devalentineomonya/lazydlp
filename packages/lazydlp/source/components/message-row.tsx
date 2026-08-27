import {Box, Text} from 'ink';
import React from 'react';
import Spinner from './spinner.js';
import Gradient from 'ink-gradient';
import {Message} from '../types/types.js';
import {theme} from '../utils/theme.js';

type Props = {
	message: Message;
	collapsed: boolean;
};

const collapse = (text: string, collapsed: boolean) =>
	collapsed ? text.split('\n').slice(-4).join('\n') : text;

function MessageRow({message: msg, collapsed}: Props) {
	return (
		<Box flexDirection="column" marginY={0} paddingY={0}>
			{msg.type === 'user' && (
				<Box paddingX={0}>
					<Text color={theme.dim}>❯ </Text>
					<Text>{msg.text}</Text>
				</Box>
			)}
			{msg.type === 'yt-dlp' && (
				<Box paddingLeft={0} flexDirection="column">
					<Box flexDirection="row">
						{msg.isPending ? (
							<Text color={theme.dim}>
								<Spinner step={msg.revision ?? 0} />{' '}
							</Text>
						) : (
							<Text color={theme.dim}>└ </Text>
						)}
						{msg.isPending && msg.text.includes('\n') && (
							<Text color={theme.dim}>
								(ctrl+o to {collapsed ? 'expand' : 'collapse'})
							</Text>
						)}
					</Box>
					{msg.isPending ? (
						<Gradient name="pastel">
							<Text>{collapse(msg.text, collapsed)}</Text>
						</Gradient>
					) : (
						<Text dimColor>{collapse(msg.text, collapsed)}</Text>
					)}
				</Box>
			)}
			{msg.type === 'system' && msg.isPending && (
				<Box paddingLeft={0}>
					<Text color={theme.dim}>
						<Spinner step={msg.revision ?? 0} />{' '}
					</Text>
					<Gradient name="pastel">
						<Text>{msg.text}</Text>
					</Gradient>
				</Box>
			)}
			{msg.type === 'system' && !msg.isPending && (
				<Box paddingLeft={0}>
					<Text color={theme.dim}>└ </Text>
					<Text color={theme.success}>{msg.text}</Text>
				</Box>
			)}
			{msg.type === 'error' && (
				<Box paddingLeft={0}>
					<Text color={theme.dim}>└ </Text>
					<Text color={theme.error}>{msg.text}</Text>
				</Box>
			)}
		</Box>
	);
}

export default React.memo(MessageRow);
