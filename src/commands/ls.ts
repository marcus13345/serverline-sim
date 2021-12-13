import { system, autoColorString } from '@kernel:base';
import chalk from 'chalk';

export default function ls(flags: any) {
  // if(flags) console.log(flags)

  console.log('Instances', chalk.ansi256(242)('(' + system.instances.size + ')'));
  for(const [k, v] of system.instances) {
    console.log(
      '    '
      + autoColorString(k.substring(0, 4))
      + ':', JSON.stringify(v.config, null, 2).replace('\n', '    ').trim()
    );
  }
}