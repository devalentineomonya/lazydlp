import test from 'ava';
import {useMessageStore} from '../source/store/message-store.js';

test.beforeEach(() => {
	useMessageStore.setState({history: []});
});

test.serial('assigns unique ids', t => {
	const store = useMessageStore.getState();
	store.addMessage('system', 'a');
	store.addMessage('system', 'b');
	const ids = useMessageStore.getState().history.map(m => m.id);
	t.is(new Set(ids).size, ids.length);
});

test.serial('updates a pending message', t => {
	const store = useMessageStore.getState();
	const id = store.addTemporaryMessage('yt-dlp', 'working', true);
	store.updateMessage(id, 'still working', true);
	const [message] = useMessageStore.getState().history;
	t.is(message?.text, 'still working');
	t.true(message?.isPending);
});

test.serial('settles a pending message', t => {
	const store = useMessageStore.getState();
	const id = store.addTemporaryMessage('yt-dlp', 'working', true);
	store.updateMessage(id, 'done', false);
	const [message] = useMessageStore.getState().history;
	t.is(message?.text, 'done');
	t.false(message?.isPending);
});

test.serial('refuses to send a settled message back to pending', t => {
	// <Static> has already committed settled messages to the terminal. Letting
	// one return to the live frame would print a second copy of it.
	const store = useMessageStore.getState();
	const id = store.addTemporaryMessage('yt-dlp', 'working', true);
	store.updateMessage(id, 'done', false);
	store.updateMessage(id, 'resurrected', true);
	const [message] = useMessageStore.getState().history;
	t.is(message?.text, 'done');
	t.false(message?.isPending);
});

test.serial('clearing empties history and bumps the static epoch', t => {
	const store = useMessageStore.getState();
	const before = useMessageStore.getState().staticEpoch;
	store.addMessage('system', 'a');
	store.clearMessages();
	t.is(useMessageStore.getState().history.length, 0);
	t.is(useMessageStore.getState().staticEpoch, before + 1);
});
