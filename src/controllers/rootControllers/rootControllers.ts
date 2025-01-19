// ------------------------------------------------------------------------------------------

import { Request, Response } from 'express';

import asyncHandler from '../../utils/asyncHandler/asyncHandler';

// ------------------------------------------------------------------------------------------

export const getRoot = asyncHandler(
	async (_req: Request, res: Response): Promise<void> => {
		res.status(200).json({
			success: true,
			message: 'OK.',
			description: 'Speckvue users service backend is up and running.',
		});
	},
);

// ------------------------------------------------------------------------------------------
