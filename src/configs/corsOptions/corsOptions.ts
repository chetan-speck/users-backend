// ------------------------------------------------------------------------------------------

import { CorsOptions } from 'cors';

// ------------------------------------------------------------------------------------------

const corsOptions: CorsOptions = {
	origin: (_origin, callback) => {
		callback(null, true);
	},
	methods: [
		'GET',
		'POST',
		'PUT',
		'PATCH',
		'DELETE',
		'OPTIONS',
		'HEAD',
		'CONNECT',
		'TRACE',
	],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
};

// ------------------------------------------------------------------------------------------

export default corsOptions;

// ------------------------------------------------------------------------------------------
