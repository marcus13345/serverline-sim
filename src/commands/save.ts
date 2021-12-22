import { system, ParsedSystemState } from '@kernel:base';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

export default function save() {
  const timeStart = new Date().getTime();
  const obj: ParsedSystemState = {
    handoff: system.handoff,
    instances: {},
    aliases: {},
    devMode: system.devMode
  };
  for(const [id, info] of system.instances.entries()) {
    obj.instances[id] = {
      config: info.privateScope.config,
      module: info.module
    }
  }
  for(const [alias, id] of system.aliases.entries()) {
    obj.aliases[alias] = id;
  }
  const systemString = JSON.stringify(obj, null, 2);
  const fullPath = resolve('.system');
  writeFileSync(fullPath, systemString);
  const elapsed = new Date().getTime() - timeStart;
  console.log('System saved to ' + fullPath + ' in ' + elapsed + ' ms')
}