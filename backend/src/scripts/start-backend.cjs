const { spawn } = require('child_process');
const path = require('path');

const backendDir = 'D:\\work\\haven horizen project\\backend';
const logFile = 'D:\\work\\haven horizen project\\.freebuff\\backend.log';
const errFile = 'D:\\work\\haven horizen project\\.freebuff\\backend.err';

const fs = require('fs');
const out = fs.openSync(logFile, 'w');
const err = fs.openSync(errFile, 'w');

const child = spawn('npx', ['tsx', 'src/server.ts'], {
  cwd: backendDir,
  detached: true,
  stdio: ['ignore', out, err],
  shell: true
});

console.log('Backend PID:', child.pid);
child.unref();
