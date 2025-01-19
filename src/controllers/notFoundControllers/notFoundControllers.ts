// ------------------------------------------------------------------------------------------

import { Request, Response } from 'express';

import asyncHandler from '../../utils/asyncHandler/asyncHandler';

// ------------------------------------------------------------------------------------------

export const notFound = asyncHandler(
	async (_req: Request, res: Response): Promise<void> => {
		res.status(404).json({
			success: false,
			message: 'Not Found',
			description:
				'The requested resource could not be found on the server.',
		});
		return;
	},
);

// ------------------------------------------------------------------------------------------
