import telnet from 'telnet';
import { exec, Instance } from '@kernel:base';
import log from '@kernel:log-hook';



export function start(this: Instance["privateScope"]) {
  telnet.createServer(function (client: any) {
  
    // make unicode characters work properly
    client.do.transmit_binary()
  
    // make the client emit 'window size' events
    client.do.window_size()
  
    // listen for the window size events from the client
    client.on('window size', function (e: any) {
      if (e.command === 'sb') {
        // console.log('telnet window resized to %d x %d', e.width, e.height)
      }
    })
  
    console.log('Telnet client connected');

    // listen for the actual data from the client
    client.on('data', function (b: any) {
      exec(b.toString().trim());
    })
  
    log.on('data', (e: any) => {
      client.write(e)
    })
  
  }).listen(this.config.port ?? 2323)
}