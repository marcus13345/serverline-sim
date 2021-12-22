

export default function createExecutor(functions: any) {
  return async function execute(...options: string[]) {
    const [cmd, ...args] = options;
    if(cmd in functions) {
      const toInvoke: (...args: any[]) => void | Promise<void> = functions[cmd as keyof typeof functions];
      return await toInvoke(...args);
    } else {
      console.log('Unknown command', cmd);
      return;
    }
  }
}