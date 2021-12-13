import { exec } from '@kernel:base';

export function boot() {
  for(const [name, script] of Object.entries(this.config)) {
    exec(script);
  }
}

export function add(name: string, ...commandParts: string[]) {
  this.config ??= {};
  this.config[name] = commandParts.join(' ');
}