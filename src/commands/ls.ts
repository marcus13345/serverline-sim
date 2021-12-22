import { system, autoColorString, reverseAliasMap } from '@kernel:base';
import chalk from 'chalk';

export default function ls(flags: any) {
  // if(flags) console.log(flags)

  console.log('Instances', chalk.ansi256(242)('(' + system.instances.size + ')'));
  const aliases = reverseAliasMap();
  for(const [id, instance] of system.instances) {
    if(aliases.has(id)) {
      console.log('  ' + autoColorString(aliases.get(id)) + chalk.ansi256(242)(' (' + id + ')'));
    } else {
      console.log('  ' + autoColorString(id.substring(0, 8)) + chalk.ansi256(242)(' (' + instance.module + ')'));
    }

    for(const [configKey, configVal] of Object.entries(instance.privateScope.config)) {

      const valueString = (function() {
        if(typeof configVal === 'number') {
          return chalk.ansi256(172)(configVal)
        } else if (typeof configVal === 'string'){
          return chalk.ansi256(39)('\'' + configVal + '\'')
        } else {
          return configVal;
        }
      })()

      console.log('    ' + chalk.ansi256(240)(configKey + ': ' + valueString));
    }
  }
}