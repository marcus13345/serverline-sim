import { exec } from '@kernel:base';

// export default {
//   config: {

//   }
// }

export async function boot() {
  for(const [name, script] of Object.entries(this.config)) {
    try {
      await exec(script as string);
    } catch (e) {
      console.log('systemd startup script \'' + name + '\' failed with error:')
      console.log(e);
    }
  }
}

export function add(name: string, ...commandParts: string[]) {
  this.config ??= {};
  this.config[name] = commandParts.join(' ');
}