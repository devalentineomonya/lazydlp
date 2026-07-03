import {Box, Text} from 'ink';
import React from 'react';
import {theme} from '../utils/theme.js';

type Props = {
	title: string;
	header?: string;
	options: string[];
	selectedIndex: number;
	showNumbers?: boolean;
};

export default function ActionMenu({
	title,
	header,
	options,
	selectedIndex,
	showNumbers = false,
}: Props) {
	return (
		<Box flexDirection="column" marginTop={1}>
			<Text>{title}</Text>
			{header && (
				<Text bold color={theme.text}>
					{header}
				</Text>
			)}
			<Box flexDirection="column" marginTop={0}>
				{options.map((label, i) => (
					<Box key={i}>
						<Text
							color={i === selectedIndex ? theme.link : theme.text}
							bold={i === selectedIndex}
						>
							{i === selectedIndex ? '> ' : '  '}
							{showNumbers ? `${i + 1}. ` : ''}
							{label}
						</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
}
