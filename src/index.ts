/// <reference path="./externals.d.ts" />

import { Instance, ParsedSystemState, System } from '@kernel:base';
import '@kernel:log-hook';
import createExecutor from '@commands:executor';
import create from '@commands:create';
import ls from '@commands:ls';
import save from '@commands:save';
import help from '@commands:help';
import * as uuid from 'uuid';
import serverline from 'serverline';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path'
import chalk from 'chalk';
import md5 from 'md5';

const args = process.argv.slice(2);
const [ startupFile ] = args;

export const system: System = {
  instances: new Map<string, Instance>(),
  handoff: '',
  aliases: new Map<string, string>(),
  devMode: false
}

export function reverseAliasMap() {
  const map = new Map<string, string>();
  for(const [u, v] of system.aliases.entries()) {
    map.set(v, u)
  }
  return map;
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

  const args: (string | number | boolean)[] = [];
  for(const arg of s.split(' ')) {
    const asNum = parseFloat(arg);
    const isTrue = arg.toLowerCase() === 'true';
    const isBoolean = isTrue || arg.toLowerCase() === 'false';
    if(isBoolean) {
      args.push(isTrue);
    } else if(!isNaN(asNum)) {
      args.push(asNum)
    } else {
      args.push(arg);
    }
  }

  return await executor(...args);
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
    // TODO add a user interaction requirement here... its kindof rm -rf...
    system.handoff = '';
    system.instances = new Map();
    system.aliases = new Map();
    console.log('System has been reset.');
  },
  exec: exec,
  async invoke(location: string, fn: string, ...args: string[]) {
    if(system.aliases.has(location)) {
      location = system.aliases.get(location);
    }
    if(!system.instances.has(location)) {
      throw new Error('INVOCATION_TARGET_DOES_NOT_EXIST: ' + location);
    }
    const instance = system.instances.get(location);
    if(!(fn in instance.functions)) {
      throw new Error('FUNCTION_DOES_NOT_EXIST_ON_INVOCATION_TARGET');
    }
    const bound = instance.functions[fn].bind(instance.privateScope);
    const result = await bound(...args);
    return result;
  },
  async script(path: string) {
    const fullPath = resolve(path);
    const lines = readFileSync(fullPath).toString().split('\n').map(v => v.trim());
    for(const line of lines) {
      await exec(line);
    }
  },
  set(variable: string, ...rest: any) {
    if(rest.length > 1) {
      (system as any)[variable] = rest.join(' ');
    } else {
      (system as any)[variable] = rest[0];
    }
  },
  help: help
};

const executor = createExecutor(kernel);

(async () => {

  if(existsSync('.system')) {
    const state: ParsedSystemState = JSON.parse(readFileSync('.system').toString());
    system.handoff = state.handoff;
    for(const [id, info] of Object.entries(state.instances)) {
      const [alias] = Object.entries(state.aliases).find(([,tryId]) => tryId === id) ?? [undefined];
      await kernel.create(info.module, alias, id);
      system.instances.get(id).privateScope.config = info.config;
    }
    checkpoint('System State Restored');
  }

  if(startupFile) {
    await exec('script ' + startupFile);
    checkpoint('Script Finished');
    await exec('quit');
    return;
  }

  await exec(system.handoff);
  checkpoint('Handoff Finished');

  serverline.init({ prompt: chalk.cyan('λ ') });
  serverline.setCompletion(Object.keys(kernel));
  serverline.on('line', async (a: string) => {
    if(a.trim() === "") return;
    const res = await exec(a, false);
    if(res !== undefined) {
      console.log(chalk.ansi256(211)('< ' + res));
    }
  });
  serverline.on('SIGINT', () => exec('quit'));
  console.log('For help, type help');

})().catch((e: Error) => {
  console.error(e);
});

checkpoint('Kernel Loaded');
import '@echo off';