// ------------------------------------------------------------------------------------------

import { format as dateFormat } from 'date-fns';
import fs from 'fs';
import path from 'path';
import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// ------------------------------------------------------------------------------------------

const { combine, timestamp, printf, errors, colorize } = format;

// ------------------------------------------------------------------------------------------

const logDirPath = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDirPath)) {
	fs.mkdirSync(logDirPath, { recursive: true });
}

// ------------------------------------------------------------------------------------------

const logFormat = printf(({ level, message, timestamp }) => {
	const formattedTimestamp = dateFormat(
		new Date(timestamp as Date),
		'yyyy-MM-dd HH:mm:ss.SSS XXX',
	);

	return `[${formattedTimestamp}] [${level}] [PID: ${process.pid}] [ENV: ${process.env.NODE_ENV || 'development'}] ${message}`;
});

// ------------------------------------------------------------------------------------------

const dailyRotateTransport = new DailyRotateFile({
	filename: path.join(logDirPath, 'app-%DATE%.log'),
	datePattern: 'YYYY-MM-DD',
	maxSize: '20m',
	maxFiles: '90d',
	zippedArchive: true,
});

// ------------------------------------------------------------------------------------------

const logger = winston.createLogger({
	level: 'silly',
	format: combine(timestamp(), errors({ stack: true }), logFormat),
	transports: [
		new winston.transports.Console({
			format: combine(
				colorize(),
				timestamp(),
				errors({ stack: true }),
				logFormat,
			),
		}),
		dailyRotateTransport,
	],
});

// ------------------------------------------------------------------------------------------

export default logger;

// ------------------------------------------------------------------------------------------
