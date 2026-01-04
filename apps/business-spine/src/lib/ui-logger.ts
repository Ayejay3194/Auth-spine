// Simple UI logger for components - replaces console.* calls
export const uiLogger = {
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[UI Error] ${message}`, error, context);
    }
    // In production, this would send to your logging service
  },
  
  warn: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[UI Warning] ${message}`, context);
    }
  },
  
  info: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[UI Info] ${message}`, context);
    }
  },
  
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[UI Debug] ${message}`, context);
    }
  }
};
