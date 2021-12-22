import { exec } from "@kernel:base";

export default {
  config: {
    bandits: []
  }
}

function weightedAverage(average: number, newDatum: number, previousAverages: number) {
  return (average * previousAverages + newDatum) / (previousAverages + 1);
}

export async function run(tries: number) {
  const data: {
    pulls: {
      [name: string]: number
    },
    averages: {
      [name: string]: number
    },
    average: number
  } = {
    pulls: {},
    averages: {},
    average: 0
  };
  let rewardTotal = 0;

  for(const slot of this.config.bandits) {
    data.pulls[slot] = 0;
    data.averages[slot] = 0;
  }
  data.average = 0;
  
  for(let i = 0; i < tries; i ++) {

    const slot = (() => {
      const noDataSlots = this.config.bandits.filter((bandit: string) => data.pulls[bandit] === 0);
      if(noDataSlots.length > 0) return noDataSlots[Math.floor(Math.random() * noDataSlots.length)]
      return this.config.bandits.map((s: string) => {
        return {
          name: s,
          rating: data.averages[s]
        }
      }).sort((a: any, b: any) => a.rating > b.rating)[0].name;
    })();

    console.log(`Pulling ${slot}...`);
    const result = await exec(`invoke ${slot} pull`);
    rewardTotal += result;
    data.averages[slot] = weightedAverage(data.averages[slot], result, data.pulls[slot]);
    data.pulls[slot] ++;
    console.log(`Got ${result.toFixed(2)} reward`);
  }

  console.log('Sim finished with total reward ' + rewardTotal);

  const trueAverages: any = {};
  let maxSlot = null;
  let maxAvg = -Infinity;

  for(const slot of this.config.bandits) {
    const avg = await exec(`invoke ${slot} getAverageReward`);
    if(avg > maxAvg) {
      maxSlot = slot;
      maxAvg = avg;
    }
  }

  const maxReward = maxAvg * tries;
  const regret = maxReward - rewardTotal;
  console.log('Regret percent: ' + ((regret / maxReward) * 100).toFixed(2) + '%');

}

export function addBandit(name: string) {
  this.config.bandits.push(name);
}