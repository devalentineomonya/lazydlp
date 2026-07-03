import {Box, Text, useInput} from 'ink';
import React, {useState} from 'react';
import Spinner from 'ink-spinner';
import Gradient from 'ink-gradient';
import {Message} from '../types/types.js';
import {theme} from '../utils/theme.js';

type Props = {
	history: Message[];
};

export default function MessageHistory({history}: Props) {
	const [collapsed, setCollapsed] = useState(true);

	useInput((input, key) => {
		if (input === 'o' && key.ctrl) {
			setCollapsed(prev => !prev);
		}
	});

	return (
		<Box flexDirection="column" marginBottom={1}>
			{history.map(msg => (
				<Box key={msg.id} flexDirection="column" marginY={0} paddingY={0}>
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
										<Spinner type="dots" />{' '}
									</Text>
								) : (
									<Text color={theme.dim}>└ </Text>
								)}
								{msg.text.includes('\n') && (
									<Text color={theme.dim}>
										(ctrl+o to {collapsed ? 'expand' : 'collapse'})
									</Text>
								)}
							</Box>
							{msg.isPending ? (
								<Gradient name="pastel">
									<Text>
										{collapsed
											? msg.text.split('\n').slice(-4).join('\n')
											: msg.text}
									</Text>
								</Gradient>
							) : (
								<Text dimColor>
									{collapsed
										? msg.text.split('\n').slice(-4).join('\n')
										: msg.text}
								</Text>
							)}
						</Box>
					)}
					{msg.type === 'system' && msg.isPending && (
						<Box paddingLeft={0}>
							<Text color={theme.dim}>
								<Spinner type="dots" />{' '}
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
			))}
		</Box>
	);
}
