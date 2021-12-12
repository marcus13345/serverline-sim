/// <reference path="./externals.d.ts" />

import * as serverline from 'serverline';
import createExecutor from './commands/executor';
import { create } from './commands/create';

console.clear();

// const system = {
  
// }

serverline.init({
  prompt: 'λ '
});
// serverline.setCompletion(['help', 'command1', 'command2', 'login', 'check', 'ping'])

const executor = createExecutor({
  create: create,
  quit() {
    console.log('Shutting down');
    process.exit(0)
  }
});

serverline.on('line', (s: string) => executor(...(s.split(' '))))
 
serverline.on('SIGINT', () => {
  executor('quit');
});
