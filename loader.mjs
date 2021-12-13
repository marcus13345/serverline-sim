import * as tsNode from 'ts-node/esm';
import * as tsConfigPaths from "tsconfig-paths";
import chalk from 'chalk';
import { dirname, resolve as pathResolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const load = tsNode.load;
export const transformSource = tsNode.transformSource;
export const getFormat = tsNode.getFormat;

let imports = 0;
let echo = true;

export async function resolve(specifier, context, defaultResolver) {
  if(echo === false) {
  } else if(imports === 0) {
    console.log(chalk.black.bgAnsi256(204)('   Welcome to Vogue System Runtime   '));
    console.log(chalk.green('#'), chalk.ansi256(242)('@kernel'))
  } else {
    console.log(chalk.green('#'), chalk.ansi256(242)(specifier));
  }

  if(specifier === '@echo off') {
    echo = false;
  }

  const maps = {
    'file:///boot':       pathResolve(__dirname, 'src', 'index.ts'),

    '@kernel:base':       pathResolve(__dirname, 'src', 'index.ts'),
    '@kernel:log-hook':   pathResolve(__dirname, 'src', 'logHook.ts'),

    '@commands:executor': pathResolve(__dirname, 'src', 'commands', 'executor.ts'),
    '@commands:create':   pathResolve(__dirname, 'src', 'commands', 'create.ts'),
    '@commands:ls':       pathResolve(__dirname, 'src', 'commands', 'ls.ts'),
    '@commands:save':     pathResolve(__dirname, 'src', 'commands', 'save.ts'),

    '@builtin:systemd':   pathResolve(__dirname, 'src', 'modules', 'systemd.ts'),
    '@builtin:sshd':      pathResolve(__dirname, 'src', 'modules', 'sshd.ts'),

    '@echo off':          pathResolve(__dirname, 'src', 'noop.ts')
  };

  const matches = Object.keys(maps).filter(map => specifier.startsWith(map));

  if(matches.length === 1) {
    // console.log('matches', matches);
    const match = matches[0];
    const replace = maps[match];
    const len = match.length;
    specifier = replace + specifier.substring(len)

  } else if(matches.length > 1) {
    const error = `Ambiguous import
specifier: ${specifier} matches:
${matches.map(v => '    ' + v).join('\n')}\n`;
    throw new Error(error);
  }
  // if (mappedSpecifier) {
  //   specifier = `${mappedSpecifier}.js`
  // }
  const poop = await tsNode.resolve(specifier, context, defaultResolver);
  imports ++;
  return poop;
}