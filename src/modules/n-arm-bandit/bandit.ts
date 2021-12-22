
export default {
  config: () => {
    return {
      variance: Math.random() * 10,
      base: Math.random() * 10
    };
  }
}

function randomNormal(width: number = 1, offset: number = 0) {
  var u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  const base = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  return offset + base * width;
}

export function pull() {
  console.log(randomNormal(this.config.variance, this.config.base));
}