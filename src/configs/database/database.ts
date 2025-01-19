// ------------------------------------------------------------------------------------------

import mongoose from 'mongoose';

import logger from '../../utils/logger/logger';

// ------------------------------------------------------------------------------------------

export const connectDB = async () => {
	const DATABASE_URL = process.env.DATABASE_URL;
	if (!DATABASE_URL) {
		throw new Error('DATABASE_URL environment variable is not set.');
	}

	await mongoose.connect(DATABASE_URL);
	logger.info('Successfully connected to the database.');
};

// ------------------------------------------------------------------------------------------

export const disconnectDB = async () => {
	await mongoose.disconnect();
	logger.info('Successfully disconnected from the database.');
};

// ------------------------------------------------------------------------------------------
