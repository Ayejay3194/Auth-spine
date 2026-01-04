/**
 * Business Spine Logger
 *
 * Provides structured logging for the business spine system.
 */
export class Logger {
    namespace;
    minLevel;
    constructor(namespace = "spine", minLevel = "info") {
        this.namespace = namespace;
        this.minLevel = minLevel;
    }
    shouldLog(level) {
        const levels = ["debug", "info", "warn", "error"];
        return levels.indexOf(level) >= levels.indexOf(this.minLevel);
    }
    formatEntry(entry) {
        const { timestamp, level, message, context, error } = entry;
        const parts = [
            `[${timestamp}]`,
            `[${level.toUpperCase()}]`,
            `[${this.namespace}]`,
            message,
        ];
        if (context) {
            parts.push(JSON.stringify(context));
        }
        if (error) {
            parts.push(`\n${error.stack || error.message}`);
        }
        return parts.join(" ");
    }
    log(level, message, context, error) {
        if (!this.shouldLog(level))
            return;
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
            error,
        };
        const formatted = this.formatEntry(entry);
        switch (level) {
            case "debug":
            case "info":
                console.log(formatted);
                break;
            case "warn":
                console.warn(formatted);
                break;
            case "error":
                console.error(formatted);
                break;
        }
    }
    debug(message, context) {
        this.log("debug", message, context);
    }
    info(message, context) {
        this.log("info", message, context);
    }
    warn(message, context) {
        this.log("warn", message, context);
    }
    error(message, error, context) {
        this.log("error", message, context, error);
    }
    child(namespace) {
        return new Logger(`${this.namespace}:${namespace}`, this.minLevel);
    }
}
// Default logger instance
let defaultLogger = null;
export function getLogger(namespace, minLevel) {
    if (!defaultLogger) {
        defaultLogger = new Logger("spine", process.env.LOG_LEVEL || "info");
    }
    if (namespace) {
        return defaultLogger.child(namespace);
    }
    return defaultLogger;
}
export function setLogLevel(level) {
    if (defaultLogger) {
        defaultLogger = new Logger("spine", level);
    }
}
