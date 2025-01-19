// ------------------------------------------------------------------------------------------

import { NextFunction, Request, Response } from 'express';

import logger from '../logger/logger';

// ------------------------------------------------------------------------------------------

const asyncHandler = (
	fn: (_req: Request, _res: Response, _next: NextFunction) => Promise<void>,
) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await fn(req, res, next);
		} catch (error) {
			logger.error(error);
			res.status(500).json({
				success: false,
				message: 'Internal server error.',
				description: (error as Error).message,
			});
		}
	};
};

// ------------------------------------------------------------------------------------------

export default asyncHandler;

// ------------------------------------------------------------------------------------------
