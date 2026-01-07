import type { Logger } from "./types";

export class ConsoleLogger implements Logger {
  debug(msg: string, data?: unknown) { console.debug(msg, data); }
  info(msg: string, data?: unknown) { console.info(msg, data); }
  warn(msg: string, data?: unknown) { console.warn(msg, data); }
  error(msg: string, data?: unknown) { console.error(msg, data); }
}
