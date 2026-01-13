export type LoggerConfig = {
    level: 'error' | 'warn' | 'info' | 'debug';
    format: 'json' | 'simple';
};
export declare class Logger {
    private logger;
    constructor(config: LoggerConfig);
    error(message: string, error?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
}
//# sourceMappingURL=logger.d.ts.map