import {Box, useInput} from 'ink';
import React, {useState} from 'react';
import {Message} from '../types/types.js';
import MessageRow from './message-row.js';

type Props = {
	history: Message[];
};

/**
 * Renders the *live* portion of the log — messages that can still change.
 * Settled messages are printed once via <Static> in ui.tsx so they never
 * re-render, which keeps Ink's live frame short enough to avoid full-screen
 * redraws (see ink/build/ink.js: outputHeight >= stdout.rows).
 */
export default function MessageHistory({history}: Props) {
	const [collapsed, setCollapsed] = useState(true);

	useInput((input, key) => {
		if (input === 'o' && key.ctrl) {
			setCollapsed(prev => !prev);
		}
	});

	if (history.length === 0) return null;

	return (
		<Box flexDirection="column" marginBottom={1}>
			{history.map(msg => (
				<MessageRow key={msg.id} message={msg} collapsed={collapsed} />
			))}
		</Box>
	);
}
