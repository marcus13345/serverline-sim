import { exec } from '@kernel:base';

// export default {
//   config: {

//   }
// }

export async function boot() {
  for(const [name, script] of Object.entries(this.config)) {
    await exec(script as string);
  }
}

export function add(name: string, ...commandParts: string[]) {
  this.config ??= {};
  this.config[name] = commandParts.join(' ');
}