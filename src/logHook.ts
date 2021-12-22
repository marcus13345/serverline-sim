
import { appendFileSync } from 'fs'
import { EventEmitter } from 'events'

const events = new EventEmitter();

type WriteFunction = typeof process.stdout.write;

process.stdout.write = (function(write: WriteFunction): WriteFunction {
  return function(string: string): boolean {
    events.emit('data', string);

    return write.apply(process.stdout, arguments);
  };
})(process.stdout.write);


export default events;