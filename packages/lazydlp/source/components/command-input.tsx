import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import React from 'react';
import { theme } from '../utils/theme.js';

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
	inputKey: number;
};

export default function CommandInput({
	input,
	setInput,
	onSubmit,
	isDownloading,
	suggestions,
	selectedIndex,
	inputKey
}: Props) {
	const VISIBLE_COUNT = 5;
	let startIdx = Math.max(0, selectedIndex - Math.floor(VISIBLE_COUNT / 2));
	let endIdx = startIdx + VISIBLE_COUNT;

	if (endIdx > suggestions.length) {
		endIdx = suggestions.length;
		startIdx = Math.max(0, endIdx - VISIBLE_COUNT);
	}

	const visibleSuggestions = suggestions.slice(startIdx, endIdx);
	const moreAbove = startIdx;
	const moreBelow = suggestions.length - endIdx;

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
						key={inputKey}
						value={input}
						onChange={setInput}
						onSubmit={onSubmit}
						placeholder=""
					/>
				)}
			</Box>

			{suggestions.length > 0 && !isDownloading && (
				<Box flexDirection="column" marginTop={0} paddingX={1}>
					{moreAbove > 0 && (
						<Text color={theme.dim}>  ↑ {moreAbove} more</Text>
					)}
					{visibleSuggestions.map((s, idx) => {
						const realIndex = startIdx + idx;
						const isSelected = realIndex === selectedIndex;
						return (
							<Box key={s.name} flexDirection="row">
								<Box width={20}>
									<Text color={isSelected ? theme.secondary : theme.dim}>
										{isSelected ? '❯ ' : '  '}{s.name}
									</Text>
								</Box>
								<Text color={isSelected ? theme.secondary : theme.dim}>{s.description}</Text>
							</Box>
						);
					})}
					{moreBelow > 0 && (
						<Text color={theme.dim}>  ↓ {moreBelow} more</Text>
					)}
				</Box>
			)}
		</Box>
	);
}
