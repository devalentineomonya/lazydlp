import {Box, Static, Text} from 'ink';
import React, {useMemo} from 'react';
import {theme} from './utils/theme.js';
import CommandInput from './components/command-input.js';
import HelpMenu from './components/help-menu.js';
import SettingsMenu from './components/settings-menu.js';
import MessageHistory from './components/message-history.js';
import MessageRow from './components/message-row.js';
import StatusBar from './components/status-bar.js';
import RecentMenu from './components/recent-menu.js';
import WelcomeHeader from './components/welcome-header.js';
import ActionMenu from './components/action-menu.js';
import {useAppState} from './hooks/use-app-state.js';
import {useMessageStore} from './store/message-store.js';
import {Message} from './types/types.js';
import {FILE_ACTION_LABELS, POST_DOWNLOAD_ACTIONS} from './utils/media.js';

type StaticItem = {kind: 'header'} | {kind: 'message'; message: Message};

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

	const staticEpoch = useMessageStore(state => state.staticEpoch);

	// Everything up to the first still-changing message can be printed once and
	// never touched again. Keeping it out of the live frame is what stops Ink
	// from clearing and repainting the whole terminal on every progress tick.
	const settledCount = useMemo(() => {
		let index = 0;
		while (index < history.length && !history[index]!.isPending) index++;
		return index;
	}, [history]);

	const staticItems = useMemo<StaticItem[]>(
		() => [
			{kind: 'header'},
			...history
				.slice(0, settledCount)
				.map(message => ({kind: 'message', message}) as const),
		],
		[history, settledCount],
	);

	const liveHistory = useMemo(
		() => history.slice(settledCount),
		[history, settledCount],
	);

	return (
		<Box flexDirection="column" paddingX={1} paddingTop={1}>
			<Static key={staticEpoch} items={staticItems}>
				{item =>
					item.kind === 'header' ? (
						<Box
							key="header"
							flexDirection="column"
							paddingX={1}
							paddingTop={1}
						>
							<WelcomeHeader />
							<Box marginBottom={1}>
								<Text color={theme.dim}>
									↑ Lazydlp now supports streaming downloads directly to this
									TUI
								</Text>
							</Box>
						</Box>
					) : (
						<Box key={item.message.id} paddingX={1}>
							<MessageRow message={item.message} collapsed />
						</Box>
					)
				}
			</Static>

			<MessageHistory history={liveHistory} />

			<CommandInput
				input={input}
				setInput={setInput}
				onSubmit={handleSubmit}
				isDownloading={isDownloading}
				suggestions={suggestions}
				selectedIndex={selectedIndex}
				inputKey={inputKey}
				isActive={
					!showSettings && !showHelp && !postDownloadPrompt && !showRecent
				}
				setHistoryIndex={setHistoryIndex}
			/>

			{postDownloadPrompt && (
				<ActionMenu
					title={`Download Complete: ${postDownloadPrompt.title || postDownloadPrompt.filepath}`}
					header="What next?"
					options={POST_DOWNLOAD_ACTIONS.map(a => FILE_ACTION_LABELS[a])}
					selectedIndex={promptOptionIndex}
					showNumbers={true}
				/>
			)}

			{showSettings && (
				<SettingsMenu
					onExit={() => {
						setShowSettings(false);
						addMessage('system', 'Settings saved');
					}}
				/>
			)}
			{showRecent && (
				<RecentMenu
					onExit={() => {
						setShowRecent(false);
						addMessage('system', 'Closed recent downloads menu');
					}}
				/>
			)}
			{showHelp && (
				<HelpMenu
					initialTab={helpTab}
					onExit={() => {
						setShowHelp(false);
						addMessage('system', 'Help dialog dismissed');
					}}
				/>
			)}

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
