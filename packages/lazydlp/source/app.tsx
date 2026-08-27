#!/usr/bin/env node
import {render} from 'ink';
import React from 'react';
import App from './ui.js';

render(<App />, {exitOnCtrlC: false});
