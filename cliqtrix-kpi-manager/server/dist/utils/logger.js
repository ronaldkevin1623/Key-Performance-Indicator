"use strict";
/**
 * Logger Utility
 * Winston logger configuration for application-wide logging
 *
 * Location: server/src/utils/logger.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};
// Tell winston about our colors
winston_1.default.addColors(colors);
// Define log format
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`));
// Define which transports (where to log)
const transports = [
    // Console transport
    new winston_1.default.transports.Console(),
    // Error log file
    new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
    }),
    // Combined log file
    new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'combined.log'),
    }),
];
// Create the logger
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    levels,
    format,
    transports,
});
exports.default = logger;
//# sourceMappingURL=logger.js.map