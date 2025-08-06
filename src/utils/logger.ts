/**
 * Application-wide logging utility
 * Provides structured logging with different levels and optional console output
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private enableConsole: boolean = true;
  private logEntries: LogEntry[] = [];
  private maxLogEntries: number = 1000;

  constructor() {
    // Set log level based on environment
    if (typeof window !== "undefined") {
      // Client-side environment detection
      const isDevelopment =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("dev");
      this.logLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
      this.enableConsole = isDevelopment;
    }
  }

  private createLogEntry(
    level: LogLevel,
    component: string,
    message: string,
    data?: any,
    error?: Error,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data,
      error,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private addLogEntry(entry: LogEntry): void {
    this.logEntries.push(entry);

    // Maintain max log entries
    if (this.logEntries.length > this.maxLogEntries) {
      this.logEntries.splice(0, this.logEntries.length - this.maxLogEntries);
    }

    // Console output in development
    if (this.enableConsole && this.shouldLog(entry.level)) {
      const levelNames = ["DEBUG", "INFO", "WARN", "ERROR"];
      const levelColors = ["#8B8B8B", "#0066CC", "#FF8C00", "#FF0000"];
      const color = levelColors[entry.level];

      console.groupCollapsed(
        `%c[${levelNames[entry.level]}] ${entry.component}: ${entry.message}`,
        `color: ${color}; font-weight: bold;`,
      );

      if (entry.data) {
      }

      if (entry.error) {
        console.error("Error:", entry.error);
      }

      console.groupEnd();
    }
  }

  public debug(component: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(
        LogLevel.DEBUG,
        component,
        message,
        data,
      );
      this.addLogEntry(entry);
    }
  }

  public info(component: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(
        LogLevel.INFO,
        component,
        message,
        data,
      );
      this.addLogEntry(entry);
    }
  }

  public warn(component: string, message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(
        LogLevel.WARN,
        component,
        message,
        data,
      );
      this.addLogEntry(entry);
    }
  }

  public error(
    component: string,
    message: string,
    error?: Error,
    data?: any,
  ): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(
        LogLevel.ERROR,
        component,
        message,
        data,
        error,
      );
      this.addLogEntry(entry);
    }
  }

  public getLogEntries(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logEntries.filter((entry) => entry.level >= level);
    }
    return [...this.logEntries];
  }

  public clearLogs(): void {
    this.logEntries = [];
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public setConsoleOutput(enabled: boolean): void {
    this.enableConsole = enabled;
  }

  public exportLogs(): string {
    return JSON.stringify(this.logEntries, null, 2);
  }
}

// Global logger instance
export const logger = new Logger();

// Convenience functions for common logging patterns
export const logCalculation = (
  component: string,
  operation: string,
  inputs: any,
  outputs: any,
) => {
  logger.debug(component, `Calculation: ${operation}`, {
    inputs,
    outputs,
    timestamp: Date.now(),
  });
};

export const logFormUpdate = (
  component: string,
  field: string,
  oldValue: any,
  newValue: any,
) => {
  logger.debug(component, `Form update: ${field}`, {
    oldValue,
    newValue,
    timestamp: Date.now(),
  });
};

export const logChartRender = (
  component: string,
  chartType: string,
  dataPoints: number,
) => {
  logger.debug(component, `Chart render: ${chartType}`, {
    dataPoints,
    timestamp: Date.now(),
  });
};

export const logUserAction = (
  component: string,
  action: string,
  details?: any,
) => {
  logger.info(component, `User action: ${action}`, {
    ...details,
    timestamp: Date.now(),
  });
};

export const logError = (
  component: string,
  operation: string,
  error: Error,
  context?: any,
) => {
  logger.error(component, `Error in ${operation}`, error, {
    ...context,
    timestamp: Date.now(),
  });
};

export const logPerformance = (
  component: string,
  operation: string,
  duration: number,
  metadata?: any,
) => {
  logger.debug(component, `Performance: ${operation}`, {
    duration,
    ...metadata,
    timestamp: Date.now(),
  });
};
