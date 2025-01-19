// ------------------------------------------------------------------------------------------

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';

import logger from '../logger/logger';

// ------------------------------------------------------------------------------------------

const algorithm = 'aes-256-cbc';

// ------------------------------------------------------------------------------------------

export const hashData = async (data: string): Promise<string> => {
	try {
		const salt = await bcrypt.genSalt(12);
		const hashedData = await bcrypt.hash(data, salt);
		return hashedData;
	} catch (error) {
		logger.error(error);
		throw new Error('Failed to hash data.');
	}
};

export const verifyHashData = async (
	data: string,
	hashedData: string,
): Promise<boolean> => {
	try {
		const match = await bcrypt.compare(data, hashedData);
		return match;
	} catch (error) {
		logger.error(error);
		throw new Error('Failed to verify hashed data.');
	}
};

// ------------------------------------------------------------------------------------------

export const encryptPrivateData = (data: string): string => {
	try {
		const PRIVATE_ENCRYPTION_SECRET_KEY =
			process.env.PRIVATE_ENCRYPTION_SECRET_KEY;
		if (!PRIVATE_ENCRYPTION_SECRET_KEY) {
			throw new Error(
				'PRIVATE_ENCRYPTION_SECRET_KEY environment variable is not set.',
			);
		}

		const iv = crypto.randomBytes(16);
		const key = crypto.scryptSync(
			PRIVATE_ENCRYPTION_SECRET_KEY,
			'salt',
			32,
		);
		const cipher = crypto.createCipheriv(algorithm, key, iv);

		let encrypted = cipher.update(data, 'utf8', 'hex');
		encrypted += cipher.final('hex');

		return `${iv.toString('hex')}:${encrypted}`;
	} catch (error) {
		logger.error(error);
		throw new Error('Failed to encrypt private data.');
	}
};

export const decryptPrivateData = (encryptedData: string): string => {
	try {
		const PRIVATE_ENCRYPTION_SECRET_KEY =
			process.env.PRIVATE_ENCRYPTION_SECRET_KEY;
		if (!PRIVATE_ENCRYPTION_SECRET_KEY) {
			throw new Error(
				'PRIVATE_ENCRYPTION_SECRET_KEY environment variable is not set.',
			);
		}

		const [iv, encrypted] = encryptedData.split(':');
		const ivBuffer = Buffer.from(iv, 'hex');
		const key = crypto.scryptSync(
			PRIVATE_ENCRYPTION_SECRET_KEY,
			'salt',
			32,
		);
		const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);

		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');

		return decrypted;
	} catch (error) {
		logger.error(error);
		throw new Error('Failed to decrypt private data.');
	}
};

// ------------------------------------------------------------------------------------------

export const encryptPublicData = (data: string): string => {
	try {
		const PUBLIC_ENCRYPTION_SECRET_KEY =
			process.env.PUBLIC_ENCRYPTION_SECRET_KEY;
		if (!PUBLIC_ENCRYPTION_SECRET_KEY) {
			throw new Error(
				'PUBLIC_ENCRYPTION_SECRET_KEY environment variable is not set.',
			);
		}

		const key = CryptoJS.enc.Utf8.parse(PUBLIC_ENCRYPTION_SECRET_KEY);
		const iv = CryptoJS.lib.WordArray.random(16);
		const encrypted = CryptoJS.AES.encrypt(data, key, { iv }).toString();

		return `${iv.toString(CryptoJS.enc.Hex)}:${encrypted}`;
	} catch (error) {
		logger.error(error);
		throw new Error('Failed to encrypt public data.');
	}
};

export const decryptPublicData = (encryptedData: string): string => {
	try {
		const PUBLIC_ENCRYPTION_SECRET_KEY =
			process.env.PUBLIC_ENCRYPTION_SECRET_KEY;
		if (!PUBLIC_ENCRYPTION_SECRET_KEY) {
			throw new Error(
				'PUBLIC_ENCRYPTION_SECRET_KEY environment variable is not set.',
			);
		}

		const [ivHex, encrypted] = encryptedData.split(':');
		const iv = CryptoJS.enc.Hex.parse(ivHex);
		const key = CryptoJS.enc.Utf8.parse(PUBLIC_ENCRYPTION_SECRET_KEY);

		const bytes = CryptoJS.AES.decrypt(encrypted, key, { iv });
		const decrypted = bytes.toString(CryptoJS.enc.Utf8);

		if (!decrypted) {
			throw new Error('Failed to decrypt public data.');
		}

		return decrypted;
	} catch (error) {
		logger.error(error);
		throw new Error('Failed to decrypt public data.');
	}
};

// ------------------------------------------------------------------------------------------
