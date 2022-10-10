export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

const logLevel =
  LogLevel[(process.env.LOG_LEVEL as keyof typeof LogLevel) || LogLevel.INFO];

const colouriseByLogLevel = {
  [LogLevel.DEBUG]: (content: string) => `\x1b[36m${content}\x1b[0m`,
  [LogLevel.INFO]: (content: string) => `\x1b[32m${content}\x1b[0m`,
  [LogLevel.WARN]: (content: string) => `\x1b[33m${content}\x1b[0m`,
  [LogLevel.ERROR]: (content: string) => `\x1b[31m${content}\x1b[0m`,
  [LogLevel.FATAL]: (content: string) => `\x1b[35m${content}\x1b[0m`,
};

function formatLoggable(level: LogLevel, loggable: unknown[]) {
  const timestamp = new Date().toISOString();
  const levelString = LogLevel[level];

  return [
    `${timestamp} [${colouriseByLogLevel[level](levelString)}]:`,
    ...loggable,
  ];
}

function doLog(level: LogLevel, ...loggable: unknown[]) {
  if (level < logLevel) {
    return void 0;
  }

  // eslint-disable-next-line no-console
  console.log(...formatLoggable(level, loggable));

  if (level === LogLevel.FATAL) {
    process.exit(1);
  }
}

if (logLevel) {
  doLog(LogLevel.INFO, `Log level set to ${logLevel}`);
}

export default (() => {
  doLog(LogLevel.DEBUG, "Logger initialised");
  return {
    /**
     * Log a debug message.
     * eg: reached this point in the code
     */
    debug: (...loggable: unknown[]) => doLog(LogLevel.DEBUG, ...loggable),
    /**
     * Log an informational message
     * eg: initialisation.
     */
    info: (...loggable: unknown[]) => doLog(LogLevel.INFO, ...loggable),
    /**
     * Log a warning message
     * eg: a benign error, or a potential issue.
     */
    warn: (...loggable: unknown[]) => doLog(LogLevel.WARN, ...loggable),
    /**
     * Log an error message
     * eg: a serious error, or service interruption.
     */
    error: (...loggable: unknown[]) => doLog(LogLevel.ERROR, ...loggable),
    /**
     * Log a fatal error message AND exit the process.
     * eg: a critical error, or a database connection failure.
     */
    fatal: (...loggable: unknown[]) => doLog(LogLevel.FATAL, ...loggable),
  };
})();
