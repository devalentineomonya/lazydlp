import React from 'react';
import {Box, Text} from 'ink';
import TextInput from 'ink-text-input';
import { theme } from '../theme.js';

export type Suggestion = {
	name: string;
	description: string;
};

type Props = {
	input: string;
	setInput: (val: string) => void;
	onSubmit: (val: string) => void;
	isDownloading: boolean;
	suggestions: Suggestion[];
	selectedIndex: number;
};

export default function CommandInput({
	input,
	setInput,
	onSubmit,
	isDownloading,
	suggestions,
	selectedIndex
}: Props) {
	return (
		<Box flexDirection="column">
			<Box 
				flexDirection="row"
				borderStyle="single" 
				borderColor={theme.border} 
				borderLeft={false} 
				borderRight={false}
				paddingY={0}
				paddingX={1}
			>
				<Text color={isDownloading ? theme.dim : theme.text}>
					{isDownloading ? 'Downloading... ' : '❯ '}
				</Text>
				{!isDownloading && (
					<TextInput
						value={input}
						onChange={setInput}
						onSubmit={onSubmit}
						placeholder=""
					/>
				)}
			</Box>

			{suggestions.length > 0 && !isDownloading && (
				<Box flexDirection="column" marginTop={0} paddingX={1}>
					{suggestions.map((s, index) => {
						const isSelected = index === selectedIndex;
						return (
							<Box key={s.name} flexDirection="row">
								<Box width={20}>
									<Text color={isSelected ? theme.secondary : theme.dim}>{s.name}</Text>
								</Box>
								<Text color={isSelected ? theme.secondary : theme.dim}>{s.description}</Text>
							</Box>
						);
					})}
				</Box>
			)}
		</Box>
	);
}
