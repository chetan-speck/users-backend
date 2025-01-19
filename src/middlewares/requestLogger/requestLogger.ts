// ------------------------------------------------------------------------------------------

import { NextFunction, Request, Response } from 'express';

import logger from '../../utils/logger/logger';

// ------------------------------------------------------------------------------------------

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	const startTime = process.hrtime();
	const originalSend = res.send;

	res.send = function (body: string | Buffer | object) {
		res.locals.body = body;
		return originalSend.call(this, body);
	};

	res.on('finish', () => {
		const [seconds, nanoseconds] = process.hrtime(startTime);
		const duration = seconds * 1000 + nanoseconds / 1000000;
		const logMessage: string =
			`[METHOD: ${req.method || '-'}]` +
			` [URL: ${req.originalUrl || '-'}]` +
			` [STATUS: ${res.statusCode || '-'}]` +
			` [DURATION: ${duration ? `${duration.toFixed(3)}ms` : '-'}]` +
			` [IP: ${req.ip || '-'}]` +
			` [QUERY: ${req.query && Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '-'}]` +
			` [BODY: ${req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : '-'}]` +
			` [DESCRIPTION: ${res.locals?.body ? JSON.parse(res.locals.body as string)?.description || '-' : '-'}]`;

		logger.http(logMessage);
	});

	next();
};

// ------------------------------------------------------------------------------------------

export default requestLogger;

// ------------------------------------------------------------------------------------------
