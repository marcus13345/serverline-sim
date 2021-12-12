/// <reference path="./externals.d.ts" />

// console.clear();

import '@kernel:log-hook';
import createExecutor from '@commands:executor';
import * as uuid from 'uuid';
import serverline from 'serverline';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path'
import chalk from 'chalk';

const args = process.argv.slice(2);
const [ startupFile ] = args;

type Instance = {
  config: any;
  ram: any;
  module: string;
  functions: any;
};

const system = {
  instances: new Map<string, Instance>(),
  handoff: ''
}

export const exec = async (s: string, echo = true) => {
  if(echo) console.log(chalk.cyan('@ ') + chalk.ansi256(242)(s));
  await executor(...(s.split(' ')));
};

serverline.init({
  prompt: chalk.cyan('λ ')
});

const kernel = {
  async create(module: string, name: string) {
    // TODO assert module.
    try {
      const imported = (await import('@builtin:' + module));
      const functions = 'default' in imported ? imported.default : imported;
      const id = name ?? uuid.v4().replace(/-/g, '').toUpperCase();
      system.instances.set(id, {
        config: {},
        ram: {},
        module: module,
        functions
      });
      return id;
    } catch(e) {
      console.log(e);
      e.trace();
    }
  },
  quit() {
    console.log('Shutting down');
    serverline.close();
    setTimeout(() => process.exit(0), 0);
  },
  ls(flags: any) {
    if(flags) console.log(flags)

    console.log('Instances', chalk.ansi256(242)('(' + system.instances.size + ')'));
    for(const [k, v] of system.instances) {
      let colorCode = 0;
      for(const char of k) colorCode += char.charCodeAt(0);
      colorCode %= 6 ** 3;
      colorCode += 16;
      console.log(
        '    '
        + chalk.ansi256(colorCode)(k.substring(0, 8))
        + ':', JSON.stringify(v.config, null, 2).replace('\n', '    ').trim()
      );
    }
  },
  save() {
    const timeStart = new Date().getTime();
    const obj: any = {
      handoff: system.handoff,
      instances: {}
    };
    for(const [id, info] of system.instances.entries()) {
      obj.instances[id] = {
        config: info.config,
        module: info.module
      }
    }
    const systemString = JSON.stringify(obj, null, 2);
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

serverline.on('line', (a: string) => {
  if(a.trim() === "") return;
  exec(a, false);
})
 
serverline.on('SIGINT', () => {
  exec('quit');
});



(async () => {

  if(existsSync('.system')) {
    const state: any = JSON.parse(readFileSync('.system').toString());
    system.handoff = state.handoff;
    for(const [id, info] of Object.entries<any>(state.instances)) {
      await kernel.create(info.module, id);
      system.instances.get(id).config = info.config;
    }
  }

  if(startupFile) {
    await exec('script ' + startupFile);
    console.log(chalk.green('Script finished, exitting...'));
    await exec('quit');
  }
})()

import '@echo off';

serverline.setCompletion(Object.keys(kernel))