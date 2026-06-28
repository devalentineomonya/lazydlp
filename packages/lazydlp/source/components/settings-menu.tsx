import {Box, Text, useInput} from 'ink';
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
		description: 'Whether to download entire playlists or just the single video',
		options: [true, false],
		format: (v: boolean) => (v ? 'yes' : 'no'),
	},
	{
		key: 'subtitles',
		label: 'Embed Subtitles',
		description: 'Whether to embed auto-generated or manual subtitles if available',
		options: [true, false],
		format: (v: boolean) => (v ? 'yes' : 'no'),
	},
];

export default function SettingsMenu({onExit}: {onExit: () => void}) {
	const {config, updateSetting} = useConfigStore();
	const [selectedIndex, setSelectedIndex] = useState(0);

	useInput((_, key) => {
		if (key.escape) {
			onExit();
			return;
		}

		if (key.upArrow) {
			setSelectedIndex((prev) => Math.max(0, prev - 1));
		} else if (key.downArrow) {
			setSelectedIndex((prev) => Math.min(SETTINGS_DEF.length - 1, prev + 1));
		} else if (key.return) {
			const setting = SETTINGS_DEF[selectedIndex]!;
			const currentVal = config.settings[setting.key as keyof typeof config.settings];
			const opts = setting.options;
			const currentIdx = opts.indexOf(currentVal as never);
			const nextVal = opts[(currentIdx + 1) % opts.length];
			updateSetting(setting.key as any, nextVal);
		}
	});

	const activeSetting = SETTINGS_DEF[selectedIndex];

	return (
		<Box flexDirection="column" paddingY={1}>
			<Box marginBottom={1}>
				<Text bold color={theme.primary}>
					Settings
				</Text>
			</Box>

			<Box flexDirection="column" marginBottom={1}>
				{SETTINGS_DEF.map((setting, index) => {
					const isActive = index === selectedIndex;
					const val = config.settings[setting.key as keyof typeof config.settings];
					const displayVal = setting.format ? setting.format(val as boolean) : val;

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
				<Text color={theme.link}>↑/↓</Text> Navigate · <Text color={theme.link}>enter</Text> Cycle Option · <Text color={theme.link}>esc</Text> Exit
			</Text>
		</Box>
	);
}
