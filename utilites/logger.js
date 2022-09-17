const { createLogger, format, combine, transports, winston } = require('winston');
const chalk = require('chalk');
const moment = require('moment');
const pkg = require('../package.json');
const path = require('path');
const PROJECT_ROOT = path.join(__dirname, '');
const LOG_TIMESTAMP_FORMAT = 'DD/MM/YYYY, HH:mm:ss';
let logger;

const customFormat = format.printf(({ timestamp, level, message }) => {
    // * Log format
    const serverPrefix = chalk.green(
        `${chalk.green('[')}${pkg.name}@${pkg.version}${chalk.green(']')} ${
            process.pid
        } - `
    );
    const timeStamp = `${moment(timestamp).format(LOG_TIMESTAMP_FORMAT)}`;
    const levelString = ` ${chalk.green('[')}${level}${chalk.green(']')}`;
    const messageString = `${message[0] === '{' ? '\n' : ' '}${message}`;
    return serverPrefix + timeStamp + levelString + messageString + ' ';
});

function formatLogArguments(args) {
    args = Array.prototype.slice.call(args);
    const stackInfo = getStackInfo(1);

    if (stackInfo) {
        const calleeStr = `[${stackInfo.relativePath}:${stackInfo.line}]`;
        if (typeof args[0] === 'string') {
            args[0] = args[0] + ' ' + calleeStr;
        } else {
            args.unshift(calleeStr);
        }
    }
    return args;
}

function getStackInfo(stackIndex) {
    const stacklist = new Error().stack.split('\n').slice(3);
    // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
    // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
    const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
    const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

    const s = stacklist[stackIndex] || stacklist[0];
    const sp = stackReg.exec(s) || stackReg2.exec(s);

    if (sp && sp.length === 5) {
        return {
            method: sp[1],
            relativePath: path.relative(PROJECT_ROOT, sp[2]),
            line: sp[3],
            pos: sp[4],
            file: path.basename(sp[2]),
            stack: stacklist.join('\n'),
        };
    }
}

if (process.env.NODE_ENV === 'PROD') {
    // Google App Engine
    // Imports the Google Cloud client library for Winston
    const { LoggingWinston } = require('@google-cloud/logging-winston');
    const loggingWinston = new LoggingWinston({
        projectId: 'your-project-id',
        keyFilename: '/path/to/key.json',
    });
    logger = createLogger({
        level: process.env.LOG_LEVEL,
        transports: [
            // Add console transport
            new transports.Console({
                format: format.combine(format.colorize({ level: true })),
            }),

            // Add Stackdriver transport
            loggingWinston,
        ],
        exitOnError: false,
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            format.splat(),
            format.label({ label: { name: pkg.name, version: pkg.version } }),
            format.printf(
                ({ level, message, label, timestamp }) =>
                    `${timestamp} ${label || '-'} ${level}: ${message}`
            ),
            format.json()
        ),
    });
    logger.add(loggingWinston);
} else {
    // Now Zeit
    logger = createLogger({
        level: process.env.LOG_LEVEL,
        transports: [
            // Add console transport
            new transports.Console({
                format: format.combine(format.colorize({ level: true }), customFormat),
            }),

        ],
        exitOnError: false,
    });
    logger.add(
        new transports.File({
            level: 'info',
            filename: './logs/all-logs.log',
            handleExceptions: true,
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                format.errors({ stack: true }),
                format.printf(
                    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
                ),
                // winston.format.splat(),
                format.json()
            ),
            maxsize: 5242880, //5MB
            maxFiles: 5,
        }),
        new transports.File({
            level: 'debug',
            filename: './logs/all-logs.log',
            handleExceptions: true,
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss',
                }),
                format.errors({ stack: true }),
                format.printf(
                    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
                ),
                // winston.format.splat(),
                format.json()
            ),
            maxsize: 5242880, //5MB
            maxFiles: 5,
        }),
    );
}

module.exports.info = function () {
    logger.info.apply(logger, formatLogArguments(arguments));
};
module.exports.log = function () {
    logger.log.apply(logger, formatLogArguments(arguments));
};
module.exports.warn = function () {
    logger.warn.apply(logger, formatLogArguments(arguments));
};
module.exports.debug = function () {
    logger.debug.apply(logger, formatLogArguments(arguments));
};
module.exports.verbose = function () {
    logger.verbose.apply(logger, formatLogArguments(arguments));
};

module.exports.error = function () {
    logger.error.apply(logger, formatLogArguments(arguments));
};

module.exports.log = logger;
