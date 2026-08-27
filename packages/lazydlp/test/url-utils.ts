import test from 'ava';
import {isValidYouTubeUrl, splitUrlAndArgs} from '../source/utils/url-utils.js';

const url = 'https://youtu.be/dQw4w9WgXcQ';

test('accepts youtube.com and youtu.be links', t => {
	t.true(isValidYouTubeUrl(url));
	t.true(isValidYouTubeUrl('https://www.youtube.com/watch?v=abc'));
	t.false(isValidYouTubeUrl('https://vimeo.com/1'));
	t.false(isValidYouTubeUrl('mp3'));
});

test('takes a bare url', t => {
	t.deepEqual(splitUrlAndArgs([url]), {url, customArgs: []});
});

test('keeps flags that follow the url', t => {
	t.deepEqual(splitUrlAndArgs([url, '-t', 'mp3']), {
		url,
		customArgs: ['-t', 'mp3'],
	});
});

test('finds the url when flags come first', t => {
	// Regression: picking "the first token that is not a flag" chose the flag's
	// value (mp3) instead of the url, and the download was rejected.
	t.deepEqual(splitUrlAndArgs(['-t', 'mp3', url]), {
		url,
		customArgs: ['-t', 'mp3'],
	});
});

test('reports no url when there is none', t => {
	t.deepEqual(splitUrlAndArgs(['-t', 'mp3']), {customArgs: ['-t', 'mp3']});
});

test('consumes only one copy of a repeated url', t => {
	t.deepEqual(splitUrlAndArgs([url, url]), {url, customArgs: [url]});
});
