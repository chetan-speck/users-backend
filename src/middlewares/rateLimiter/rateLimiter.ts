// ------------------------------------------------------------------------------------------

import { formatDuration, intervalToDuration } from 'date-fns';
import rateLimit from 'express-rate-limit';

// ------------------------------------------------------------------------------------------

const maxRequests = 100000;
const windowMs = 24 * 60 * 60 * 1000;

// ------------------------------------------------------------------------------------------

const rateLimiter = rateLimit({
	windowMs,
	max: maxRequests,
	headers: true,
	handler: (_req, res) => {
		const duration = intervalToDuration({ start: 0, end: windowMs });
		const formattedDuration = formatDuration(duration, {
			delimiter: ', ',
		});

		res.status(429).json({
			success: false,
			message: 'Too many requests.',
			description: `You have exceeded the daily request limit of ${maxRequests} requests. Please wait ${formattedDuration} before making further requests.`,
		});
	},
});

// ------------------------------------------------------------------------------------------

export default rateLimiter;

// ------------------------------------------------------------------------------------------
