
import { appendFileSync } from 'fs'
import { EventEmitter } from 'events'

const events = new EventEmitter();

process.stdout.write = (function(write): any {
  return function(string: string, encoding: any, fileDescriptor: any) {
    // const ansiCodes = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    // appendFileSync('.log', string);
    events.emit('data', string);
    write.apply(process.stdout, arguments);
  };
})(process.stdout.write);


export default events;