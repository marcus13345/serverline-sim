import { system, autoColorString } from '@kernel:base';
import * as uuid from 'uuid';

export default async function create(module: string, name: string, id: string) {
  if(!module || typeof module !== 'string' || module.trim() === '') {
    throw new Error('INVALID_MODULE_NAME');
  }
  if(name && (typeof name !== 'string' || name.trim() === '')) {
    throw new Error('IVALID_MODULE_ALIAS');
  }
  name ??= module;
  if(system.aliases.has(name)) {
    if(name === module) {
      throw new Error('DEFAULT_MODULE_ALREADY_EXISTS');
    } else {
      throw new Error('MODULE_ALIAS_TAKEN');
    }
  }
  const imported = (await import('@builtin:' + module));
  const functions = 'default' in imported ? imported.default : imported;
  id ??= uuid.v4().replace(/-/g, '').toUpperCase();
  system.instances.set(id, {
    config: {},
    ram: {},
    module: module,
    functions
  });
  if(name) {
    system.aliases.set(name, id);
  }
  console.log('Created instance of', autoColorString(module))
  return id;
}