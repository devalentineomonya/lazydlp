#!/usr/bin/env node
import { Box, render, Text } from 'ink';
import React from 'react';
import { theme } from './utils/theme.js';

import CommandInput from './components/command-input.js';
import HelpMenu from './components/help-menu.js';
import MessageHistory from './components/message-history.js';
import StatusBar from './components/status-bar.js';
import WelcomeHeader from './components/welcome-header.js';
import { useAppState } from './hooks/use-app-state.js';

export default function App() {
	const {
		input,
		setInput,
		history,
		isDownloading,
		selectedIndex,
		ctrlCPressed,
		showHelp,
		helpTab,
		inputKey,
		suggestions,
		handleSubmit
	} = useAppState();

	return (
		<Box flexDirection="column" paddingX={1} paddingTop={1}>
			{history.length < 5 && <WelcomeHeader />}

			{history.length < 5 && (
				<Box marginBottom={1}>
					<Text color={theme.dim}>↑ Lazydlp now supports streaming downloads directly to this TUI</Text>
				</Box>
			)}

			<MessageHistory history={history} />

			{showHelp ? (
				<HelpMenu initialTab={helpTab} />
			) : (
				<CommandInput
					input={input}
					setInput={setInput}
					onSubmit={handleSubmit}
					isDownloading={isDownloading}
					suggestions={suggestions}
					selectedIndex={selectedIndex}
					inputKey={inputKey}
				/>
			)}

			<StatusBar ctrlCPressed={ctrlCPressed} showHelp={showHelp} />
		</Box>
	);
}

render(<App />, { exitOnCtrlC: false });
