import { exec } from "@kernel:base";

export default {
  config: {
    bandits: []
  }
}

export async function run(tries: number) {
  for(let i = 0; i < tries; i ++) {
    const slot = this.config.bandits[Math.floor(Math.random() * this.config.bandits.length)];
    const result = await exec(`invoke ${slot} pull`);
    console.log(`Pulling ${slot}...`);
    console.log(`Got ${result.toFixed(2)} reward`);
  }
}

export function addBandit(name: string) {
  this.config.bandits.push(name);
}