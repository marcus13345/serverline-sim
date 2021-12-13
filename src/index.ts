/// <reference path="./externals.d.ts" />

import '@kernel:log-hook';
import createExecutor from '@commands:executor';
import create from '@commands:create';
import ls from '@commands:ls';
import save from '@commands:save';
import * as uuid from 'uuid';
import serverline from 'serverline';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path'
import chalk from 'chalk';
import md5 from 'md5';

const args = process.argv.slice(2);
const [ startupFile ] = args;

type Instance = {
  config: any;
  ram: any;
  module: string;
  functions: any;
};

export const system = {
  instances: new Map<string, Instance>(),
  handoff: '',
  aliases: new Map<string, string>()
}

function checkpoint(string: string) {
  console.log(chalk.black.bgAnsi256(204)('   ' + string + '   '));
}

export function autoColorString(string: string) {
  let colorCode = 0;
  for(const char of md5(string)) colorCode += char.charCodeAt(0);
  colorCode %= 6 ** 3;
  colorCode += 16;
  return chalk.ansi256(colorCode)(string);
}

export const exec = async (s: string, echo = true) => {
  if(echo) console.log(chalk.cyan('@ ') + chalk.ansi256(242)(s));
  await executor(...(s.split(' ')));
};

export const kernel = {
  create: create,
  quit() {
    console.log('Shutting down');
    setTimeout(() => process.exit(0), 0);
  },
  ls: ls,
  save: save,
  reset() {
    system.handoff = '';
    system.instances = new Map();
    system.aliases = new Map();
    console.log('System has been reset.');
  },
  exec: exec,
  invoke(...a: any[]) {
    console.log(a);
  },
  async script(path: string) {
    const fullPath = resolve(path);
    const lines = readFileSync(fullPath).toString().split('\n').map(v => v.trim());
    for(const line of lines) {
      await exec(line);
    }
  }
};

const executor = createExecutor(kernel);

(async () => {

  if(existsSync('.system')) {
    const state: any = JSON.parse(readFileSync('.system').toString());
    system.handoff = state.handoff;
    for(const [id, info] of Object.entries<any>(state.instances)) {
      const [alias] =
      Object.entries(state.aliases)
      .find(([,tryId]) => tryId === id)
      ?? [undefined];
      await kernel.create(info.module, alias, id);
      system.instances.get(id).config = info.config;
    }
    checkpoint('System State Restored');
  }

  if(startupFile) {
    await exec('script ' + startupFile);
    checkpoint('Script Finished');
    await exec('quit');
  } else {
  }

  serverline.init({
    prompt: chalk.cyan('λ ')
  });
  serverline.setCompletion(Object.keys(kernel));
  serverline.on('line', (a: string) => {
    if(a.trim() === "") return;
    exec(a, false);
  });
   
  serverline.on('SIGINT', () => {
    exec('quit');
  });

})().catch((e: Error) => {
  console.error(e);
});
checkpoint('Kernel Loaded');
import '@echo off';
