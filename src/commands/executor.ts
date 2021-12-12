

export default function createExecutor(functions: any) {
  return async function execute(...options: string[]) {
    // console.log('λ', line);
    const [cmd, ...args] = options;
    if(cmd in functions) {
      const toInvoke: (...args: any[]) => void | Promise<void> = functions[cmd as keyof typeof functions];
      await toInvoke(...args);
    } else {
      console.log('Unknown command', cmd);
    }
  }
}