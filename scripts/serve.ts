#!/usr/bin/env node
import {spawn} from 'node:child_process';

const front = process.argv[2];
const env = process.argv[3];

spawn('npx', ['vite'], {
  env: {
    ...process.env,
    front,
    env: env || 'dev',
  },
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
