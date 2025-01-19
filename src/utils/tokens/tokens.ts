// ------------------------------------------------------------------------------------------

import { intervalToDuration } from 'date-fns';
import jwt from 'jsonwebtoken';

import {
	decryptPrivateData,
	encryptPrivateData,
} from '../cryptography/cryptography';
import logger from '../logger/logger';
import { AccessTokenPayload, RefreshTokenPayload } from './tokens.types';

// ------------------------------------------------------------------------------------------

const convertMsToJwtDuration = (ms: number): string => {
	const duration = intervalToDuration({ start: 0, end: ms });

	if (duration.days && duration.days > 0) {
		return `${duration.days}d`;
	} else if (duration.hours && duration.hours > 0) {
		return `${duration.hours}h`;
	} else if (duration.minutes && duration.minutes > 0) {
		return `${duration.minutes}m`;
	} else if (duration.seconds && duration.seconds > 0) {
		return `${duration.seconds}s`;
	}

	return `${duration.seconds}s`;
};

// ------------------------------------------------------------------------------------------

export const createAccessToken = (payload: AccessTokenPayload): string => {
	try {
		const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
		if (!ACCESS_TOKEN_SECRET) {
			throw new Error(
				'ACCESS_TOKEN_SECRET environment variable is not set.',
			);
		}

		const ACCESS_TOKEN_EXPIRATION_MS =
			process.env.ACCESS_TOKEN_EXPIRATION_MS;
		if (!ACCESS_TOKEN_EXPIRATION_MS) {
			throw new Error(
				'ACCESS_TOKEN_EXPIRATION_MS environment variable is not set.',
			);
		}

		const expiresIn = convertMsToJwtDuration(+ACCESS_TOKEN_EXPIRATION_MS);
		const token = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn });
		const encryptedToken = encryptPrivateData(token);

		logger.info(
			`Access token created for user ID: ${payload._id}, Expires in: 15 minutes`,
		);

		return encryptedToken;
	} catch (error) {
		logger.error(error);
		throw new Error('Failed to create access token.');
	}
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
	try {
		const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
		if (!ACCESS_TOKEN_SECRET) {
			throw new Error(
				'ACCESS_TOKEN_SECRET environment variable is not set.',
			);
		}

		const decryptedToken = decryptPrivateData(token);
		const payload = jwt.verify(
			decryptedToken,
			ACCESS_TOKEN_SECRET,
		) as AccessTokenPayload;

		logger.info(`Access token verified for user ID: ${payload._id}`);

		return payload;
	} catch (error) {
		logger.error(error);
		throw new Error('Invalid or expired access token.');
	}
};

// ------------------------------------------------------------------------------------------

export const createRefreshToken = (payload: RefreshTokenPayload): string => {
	try {
		const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
		if (!REFRESH_TOKEN_SECRET) {
			throw new Error(
				'REFRESH_TOKEN_SECRET environment variable is not set.',
			);
		}

		const REFRESH_TOKEN_EXPIRATION_MS =
			process.env.REFRESH_TOKEN_EXPIRATION_MS;
		if (!REFRESH_TOKEN_EXPIRATION_MS) {
			throw new Error(
				'REFRESH_TOKEN_EXPIRATION_MS environment variable is not set.',
			);
		}

		const expiresIn = convertMsToJwtDuration(+REFRESH_TOKEN_EXPIRATION_MS);
		const token = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn });
		const encryptedToken = encryptPrivateData(token);

		logger.info(
			`Refresh token created for user ID: ${payload._id}, Expires in: 7 days`,
		);

		return encryptedToken;
	} catch (error) {
		logger.error(error);
		throw new Error('Failed to create refresh token.');
	}
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
	try {
		const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
		if (!REFRESH_TOKEN_SECRET) {
			throw new Error(
				'REFRESH_TOKEN_SECRET environment variable is not set.',
			);
		}

		const decryptedToken = decryptPrivateData(token);
		const payload = jwt.verify(
			decryptedToken,
			REFRESH_TOKEN_SECRET,
		) as RefreshTokenPayload;

		logger.info(`Refresh token verified for user ID: ${payload._id}`);

		return payload;
	} catch (error) {
		logger.error(error);
		throw new Error('Invalid or expired refresh token.');
	}
};

// ------------------------------------------------------------------------------------------
