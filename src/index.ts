/// <reference path="./externals.d.ts" />

import './logHook.js';
import serverline from 'serverline';
import createExecutor from './commands/executor.js';
import { create } from './commands/create.js';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path'
import chalk from 'chalk';

console.clear();

const args = process.argv.slice(2);
const [ startupFile ] = args;

type Instance = any;

const system = {
  instances: new Map<string, Instance>(),
  handoff: ''
}

export const exec = (s: string, echo = true) => {
  if(echo) console.log(chalk.cyan('@ ') + chalk.ansi256(242)(s));
  executor(...(s.split(' ')));
};

serverline.init({
  prompt: chalk.cyan('λ ')
});
// serverline.setCompletion(['help', 'command1', 'command2', 'login', 'check', 'ping'])

const executor = createExecutor({
  create(module: string, name: string) {
    console.log(s);
  },
  quit() {
    console.log('Shutting down');
    serverline.close();
    process.exit(0);
  },
  ls(flags: any) {
    if(flags) console.log(flags)

    console.log('Instances (' + system.instances.size + ')');
    for(const [k, v] of system.instances) {
      console.log('    ' + k + ':', v);
    }
  },
  save() {
    const timeStart = new Date().getTime();
    const systemString = JSON.stringify(system, null, 2);
    const fullPath = resolve('.system');
    writeFileSync(fullPath, systemString);
    const elapsed = new Date().getTime() - timeStart;
    console.log('System saved to ' + fullPath + ' in ' + elapsed + ' ms')
  },
  reset() {
    system.handoff = '';
    system.instances = new Map();
    console.log('System has been reset.');
  },
  exec: exec,
  invoke(...a: any[]) {
    console.log(a);
  }
});

serverline.on('line', (a: string) => {
  exec(a, false);
})
 
serverline.on('SIGINT', () => {
  exec('quit');
});

if(startupFile) {
  const fullPath = resolve(startupFile);
  const lines = readFileSync(fullPath).toString().split('\n').map(v => v.trim());
  for(const line of lines) {
    exec(line);
  }
}