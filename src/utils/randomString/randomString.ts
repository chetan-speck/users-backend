// ------------------------------------------------------------------------------------------

import { randomBytes } from 'crypto';

import logger from '../logger/logger';

// ------------------------------------------------------------------------------------------

const randomString = (length: number): string => {
	const requiredBytes = Math.ceil(length / 2);
	let randomValue = randomBytes(requiredBytes).toString('hex');
	randomValue = randomValue.slice(0, length);
	logger.info(`Generated random string of length ${length}: ${randomValue}`);
	return randomValue;
};

// ------------------------------------------------------------------------------------------

export default randomString;

// ------------------------------------------------------------------------------------------
