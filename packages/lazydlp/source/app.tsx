#!/usr/bin/env node
import {Box, render, Text} from 'ink';
import React from 'react';
import {theme} from './utils/theme.js';
import CommandInput from './components/command-input.js';
import HelpMenu from './components/help-menu.js';
import SettingsMenu from './components/settings-menu.js';
import MessageHistory from './components/message-history.js';
import StatusBar from './components/status-bar.js';
import WelcomeHeader from './components/welcome-header.js';
import {useAppState} from './hooks/use-app-state.js';

export default function App() {
	const {
		input,
		setInput,
		history,
		isDownloading,
		selectedIndex,
		ctrlCPressed,
		showHelp,
		showSettings,
		setShowSettings,
		helpTab,
		inputKey,
		suggestions,
		handleSubmit,
		postDownloadPrompt,
		promptOptionIndex,
	} = useAppState();

	return (
		<Box flexDirection="column" paddingX={1} paddingTop={1}>
			{history.length < 5 && <WelcomeHeader />}

			{history.length < 5 && (
				<Box marginBottom={1}>
					<Text color={theme.dim}>
						↑ Lazydlp now supports streaming downloads directly to this TUI
					</Text>
				</Box>
			)}

			<MessageHistory history={history} />

			<CommandInput
				input={input}
				setInput={setInput}
				onSubmit={handleSubmit}
				isDownloading={isDownloading}
				suggestions={suggestions}
				selectedIndex={selectedIndex}
				inputKey={inputKey}
				isActive={!showSettings && !showHelp && !postDownloadPrompt}
			/>

			{postDownloadPrompt && (
				<Box flexDirection="column" borderStyle="round" borderColor={theme.success} paddingX={1} marginY={1}>
					<Text bold color={theme.success}>Download Complete!</Text>
					<Text color={theme.text} wrap="truncate-end">{postDownloadPrompt.title || postDownloadPrompt.filepath}</Text>
					<Box flexDirection="row" marginTop={1}>
						{['Open', 'Open Location', 'Delete'].map((label, i) => (
							<Box key={i} marginRight={2}>
								<Text color={i === promptOptionIndex ? theme.primary : theme.dim} bold={i === promptOptionIndex}>
									{i === promptOptionIndex ? '▶ ' : '  '}{label}
								</Text>
							</Box>
						))}
					</Box>
				</Box>
			)}

			{showSettings && <SettingsMenu onExit={() => setShowSettings(false)} />}
			{showHelp && <HelpMenu initialTab={helpTab} />}

			<StatusBar ctrlCPressed={ctrlCPressed} showHelp={showHelp} />
		</Box>
	);
}

render(<App />, {exitOnCtrlC: false});
