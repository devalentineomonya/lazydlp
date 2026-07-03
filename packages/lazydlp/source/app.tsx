#!/usr/bin/env node
import {Box, render, Text} from 'ink';
import React from 'react';
import {theme} from './utils/theme.js';
import CommandInput from './components/command-input.js';
import HelpMenu from './components/help-menu.js';
import SettingsMenu from './components/settings-menu.js';
import MessageHistory from './components/message-history.js';
import StatusBar from './components/status-bar.js';
import RecentMenu from './components/recent-menu.js';
import WelcomeHeader from './components/welcome-header.js';
import ActionMenu from './components/action-menu.js';
import {useAppState} from './hooks/use-app-state.js';
import {FileAction, FILE_ACTION_LABELS} from './utils/media.js';

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
		showRecent,
		setShowRecent,
		setShowHelp,
		addMessage,
		helpTab,
		inputKey,
		suggestions,
		handleSubmit,
		postDownloadPrompt,
		promptOptionIndex,
		setHistoryIndex,
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
				isActive={!showSettings && !showHelp && !postDownloadPrompt && !showRecent}
				setHistoryIndex={setHistoryIndex}
			/>

			{postDownloadPrompt && (
				<ActionMenu
					title={`Download Complete: ${postDownloadPrompt.title || postDownloadPrompt.filepath}`}
					header="What next?"
					options={['open', 'location', 'delete'].map(a => FILE_ACTION_LABELS[a as FileAction])}
					selectedIndex={promptOptionIndex}
					showNumbers={true}
				/>
			)}

			{showSettings && <SettingsMenu onExit={() => { setShowSettings(false); addMessage('system', 'Settings saved'); }} />}
			{showRecent && <RecentMenu onExit={() => { setShowRecent(false); addMessage('system', 'Closed recent downloads menu'); }} />}
			{showHelp && <HelpMenu initialTab={helpTab} onExit={() => { setShowHelp(false); addMessage('system', 'Help dialog dismissed'); }} />}

			<StatusBar
				ctrlCPressed={ctrlCPressed}
				activeMenu={
					showHelp
						? 'help'
						: showSettings
						? 'settings'
						: showRecent
						? 'recent'
						: postDownloadPrompt
						? 'prompt'
						: null
				}
			/>
		</Box>
	);
}

render(<App />, {exitOnCtrlC: false});
