


export default function createExecutor(functions: any) {
  return function execute(...options: string[]) {
    // console.log('λ', line);
    const [cmd, ...args] = options;
    if(cmd in functions) {
      const toInvoke: (...args: any[]) => void = functions[cmd as keyof typeof functions];
      toInvoke(...args);
    }
  }
}