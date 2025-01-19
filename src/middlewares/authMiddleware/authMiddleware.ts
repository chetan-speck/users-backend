// ------------------------------------------------------------------------------------------

import { NextFunction, Request, Response } from 'express';

import CookieName from '../../constants/cookieNames/cookieNames';
import asyncHandler from '../../utils/asyncHandler/asyncHandler';
import logger from '../../utils/logger/logger';
import {
    createAccessToken, verifyAccessToken, verifyRefreshToken
} from '../../utils/tokens/tokens';

// ------------------------------------------------------------------------------------------

const authMiddleware = asyncHandler(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const accessToken = req.cookies['access-token'];
			const refreshToken = req.cookies['refresh-token'];

			if (!refreshToken) {
				res.status(401).json({
					success: false,
					message: 'Unauthorized.',
					description: 'Refresh token is required.',
				});
				return;
			}

			try {
				const accessTokenPayload = verifyAccessToken(accessToken);

				if (!accessTokenPayload || !accessTokenPayload._id) {
					res.status(401).json({
						success: false,
						message: 'Unauthorized.',
						description: 'Access token is invalid.',
					});
					return;
				}

				req.body.user = {
					_id: accessTokenPayload._id,
				};

				next();
			} catch (error) {
				logger.error(error);

				try {
					const refreshTokenPayload =
						verifyRefreshToken(refreshToken);

					if (!refreshTokenPayload || !refreshTokenPayload._id) {
						res.status(401).json({
							success: false,
							message: 'Unauthorized.',
							description: 'Refresh token is invalid.',
						});
						return;
					}

					const newAccessToken = createAccessToken({
						_id: refreshTokenPayload._id,
					});

					res.cookie(CookieName.AccessToken, newAccessToken, {
						httpOnly: true,
						secure: false,
						maxAge: 15 * 60 * 1000,
						sameSite: 'lax',
					});

					req.body.user = {
						_id: refreshTokenPayload._id,
					};

					next();
				} catch (error) {
					logger.error(error);
					res.status(401).json({
						success: false,
						message: 'Unauthorized.',
						description: 'Refresh token is invalid or expired.',
					});
					return;
				}
			}
		} catch (error) {
			logger.error(error);
			res.status(401).json({
				success: false,
				message: 'Unauthorized.',
				description: 'Invalid or expired token.',
			});
			return;
		}
	},
);

// ------------------------------------------------------------------------------------------

export default authMiddleware;

// ------------------------------------------------------------------------------------------
