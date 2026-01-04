import type { Logger } from './types';
export class ConsoleLogger implements Logger { debug(m:string,d?:unknown){console.debug(m,d);} info(m:string,d?:unknown){console.info(m,d);} warn(m:string,d?:unknown){console.warn(m,d);} error(m:string,d?:unknown){console.error(m,d);} }
