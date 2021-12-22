import { system, autoColorString } from '@kernel:base';
import chalk from 'chalk';
import * as uuid from 'uuid';
import { merge } from 'lodash';

export default async function create(module: string, name: string, id: string) {
  if(!module || typeof module !== 'string' || module.trim() === '') {
    throw new Error('INVALID_MODULE_NAME');
  }
  if(name && (typeof name !== 'string' || name.trim() === '')) {
    throw new Error('INVALID_MODULE_ALIAS');
  }
  // undefined means no paramter given. this is treated as a default alias
  // otherise, null should be to create anonymous instances. only addressable
  // by their creator or by discovery protocols to come soon...
  name = name === undefined ? module : name;
  if(system.aliases.has(name)) {
    if(name === module) {
      throw new Error('DEFAULT_MODULE_ALREADY_EXISTS');
    } else {
      throw new Error('MODULE_ALIAS_TAKEN');
    }
  }
  const imported = (await import('@builtin:' + module));
  const { default: moduleOptions, ...functions} = imported;
  
  const config: object = (function () {
    if(moduleOptions && 'config' in moduleOptions) {
      if(typeof moduleOptions.config === 'function') {
        return moduleOptions.config();
      } else {
        return moduleOptions.config;
      }
    } else {
      return {};
    }
  })();

  id ??= uuid.v4().replace(/-/g, '').toUpperCase();
  system.instances.set(id, {
    privateScope: {
      config,
      ram: {}
    },
    module: module,
    functions
  });
  if(name) {
    system.aliases.set(name, id);
  }
  console.log('Created instance of', autoColorString(module));
  if(name) {
    console.log('   Alias:', autoColorString(name));
  }
  console.log('      Id:', chalk.ansi256(242)(id));
  return id;
}