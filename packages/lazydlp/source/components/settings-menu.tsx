import {Box, Text, useInput} from 'ink';
import TextInput from 'ink-text-input';
import React, {useState} from 'react';
import {theme} from '../utils/theme.js';
import {useConfigStore} from '../store/config-store.js';

const SETTINGS_DEF = [
	{
		key: 'downloadType',
		label: 'Download Type',
		description: 'Whether to download video or extract audio only',
		options: ['video', 'audio'],
	},
	{
		key: 'resolution',
		label: 'Video Resolution',
		description: 'Preferred maximum video resolution',
		options: ['best', '1080p', '720p', '480p'],
	},
	{
		key: 'audioFormat',
		label: 'Audio Format',
		description: 'Format to use when downloading audio only',
		options: ['best', 'mp3', 'm4a', 'wav'],
	},
	{
		key: 'playlists',
		label: 'Download Playlists',
		description:
			'Whether to download entire playlists or just the single video',
		options: [true, false],
		format: (v: boolean) => (v ? 'yes' : 'no'),
	},
	{
		key: 'subtitles',
		label: 'Embed Subtitles',
		description:
			'Whether to embed auto-generated or manual subtitles if available',
		options: [true, false],
		format: (v: boolean) => (v ? 'yes' : 'no'),
	},
	{
		key: 'jsRuntime',
		label: 'JS Runtime',
		description: 'JavaScript engine to use for extracting complex videos',
		options: ['default', 'node', 'bun', 'deno'],
	},
	{
		key: 'defaultApp',
		label: 'Default Media App',
		description: 'App to open files with (e.g. vlc, mpv). Empty means system default.',
		isStringInput: true,
	},
];

export default function SettingsMenu({onExit}: {onExit: () => void}) {
	const {config, updateSetting} = useConfigStore();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isEditing, setIsEditing] = useState(false);
	const [editOptionIndex, setEditOptionIndex] = useState(0);
	const [editStringValue, setEditStringValue] = useState('');
	const [search, setSearch] = useState('');

	const filteredSettings = SETTINGS_DEF.filter(s =>
		s.label.toLowerCase().includes(search.toLowerCase()),
	);

	const activeSetting = filteredSettings[selectedIndex];

	useInput((_, key) => {
		if (isEditing && activeSetting) {
			if (key.escape) {
				setIsEditing(false);
				return;
			}
			
			if (activeSetting.isStringInput) {
				if (key.return) {
					updateSetting(
						activeSetting.key as keyof typeof config.settings,
						editStringValue as never,
					);
					setIsEditing(false);
				}
				return;
			}

			const options = activeSetting.options!;
			if (key.upArrow) {
				setEditOptionIndex(prev => Math.max(0, prev - 1));
			} else if (key.downArrow) {
				setEditOptionIndex(prev => Math.min(options.length - 1, prev + 1));
			} else if (key.return) {
				updateSetting(
					activeSetting.key as keyof typeof config.settings,
					options[editOptionIndex] as never,
				);
				setIsEditing(false);
			}
			return;
		}

		if (key.escape) {
			if (search) {
				setSearch('');
				setSelectedIndex(0);
			} else {
				onExit();
			}
			return;
		}

		if (key.upArrow) {
			setSelectedIndex(prev => Math.max(0, prev - 1));
		} else if (key.downArrow) {
			setSelectedIndex(prev => Math.min(filteredSettings.length - 1, prev + 1));
		}
	});

	if (isEditing && activeSetting) {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Box marginBottom={1}>
					<Text bold color={theme.primary}>
						Settings &gt; {activeSetting.label}
					</Text>
				</Box>

				<Box flexDirection="column" marginBottom={1}>
					{activeSetting.isStringInput ? (
						<Box flexDirection="row">
							<Text color={theme.link}>&gt; </Text>
							<TextInput
								value={editStringValue}
								onChange={setEditStringValue}
							/>
						</Box>
					) : (
						activeSetting.options!.map((opt, i) => {
							const isSelected = i === editOptionIndex;
							const isCurrent =
								config.settings[
									activeSetting.key as keyof typeof config.settings
								] === opt;
							const displayOpt = activeSetting.format
								? activeSetting.format(opt as boolean)
								: String(opt);

							return (
								<Box key={String(opt)}>
									<Box width={2}>
										<Text color={theme.link}>{isSelected ? '>' : ' '}</Text>
									</Box>
									<Box>
										<Text color={isSelected ? theme.link : theme.text}>
											{displayOpt} {isCurrent ? '(current)' : ''}
										</Text>
									</Box>
								</Box>
							);
						})
					)}
				</Box>

				<Text color={theme.dim}>
					{!activeSetting.isStringInput && <Text><Text color={theme.link}>↑/↓</Text> Navigate · </Text>}
					<Text color={theme.link}>enter</Text> Save ·{' '}
					<Text color={theme.link}>esc</Text> Back
				</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingY={1}>
			<Box marginBottom={1}>
				<Text bold color={theme.text}>
					Settings
				</Text>
			</Box>
			<Box flexDirection="row">
				<Text>Search: </Text>
				<Box
					marginBottom={1}
					borderStyle="single"
					borderTop={false}
					borderLeft={false}
					borderRight={false}
					borderColor={theme.border}
					paddingBottom={0}
					width={20}
				>
					<TextInput
						value={search}
						onChange={val => {
							setSearch(val);
							setSelectedIndex(0);
						}}
						onSubmit={() => {
							if (activeSetting) {
								const currentVal =
									config.settings[
										activeSetting.key as keyof typeof config.settings
									];
								
								if (activeSetting.isStringInput) {
									setEditStringValue(String(currentVal || ''));
								} else {
									const opts = activeSetting.options!;
									const currentIdx = Math.max(
										0,
										opts.indexOf(currentVal as never),
									);
									setEditOptionIndex(currentIdx);
								}
								setIsEditing(true);
							}
						}}
					/>
				</Box>
			</Box>
			<Box flexDirection="column" marginBottom={1}>
				{filteredSettings.map((setting, index) => {
					const isActive = index === selectedIndex;
					const val =
						config.settings[setting.key as keyof typeof config.settings];
					const displayVal = setting.format
						? setting.format(val as boolean)
						: val;

					return (
						<Box key={setting.key}>
							<Box width={2}>
								<Text color={theme.link}>{isActive ? '>' : ' '}</Text>
							</Box>
							<Box width={25}>
								<Text color={isActive ? theme.link : theme.text}>
									{setting.label}
								</Text>
							</Box>
							<Box>
								<Text color={isActive ? theme.link : theme.text}>
									{String(displayVal)}
								</Text>
							</Box>
						</Box>
					);
				})}
			</Box>

			{activeSetting && (
				<Box marginBottom={1}>
					<Text color={theme.dim}>{activeSetting.description}</Text>
				</Box>
			)}

			<Text color={theme.dim}>
				<Text color={theme.link}>↑/↓</Text> Navigate ·{' '}
				<Text color={theme.link}>enter</Text> Edit ·{' '}
				<Text color={theme.link}>esc</Text> Exit
			</Text>
		</Box>
	);
}
