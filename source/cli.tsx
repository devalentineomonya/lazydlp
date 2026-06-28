#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
	Usage
	  $ lazydlp

	Options
		--name  Your name

	Examples
	  $ lazydlp --name=Jane

	  Hello, Jane
`,
	{
		importMeta: import.meta,
		flags: {
			name: {
				type: 'string',
			},
		},
	},
);
console.log(cli);
render(<App />, { exitOnCtrlC: false });
