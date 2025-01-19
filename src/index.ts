// ------------------------------------------------------------------------------------------

import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import http from 'http';

import corsOptions from './configs/corsOptions/corsOptions';
import { connectDB, disconnectDB } from './configs/database/database';
import rateLimiter from './middlewares/rateLimiter/rateLimiter';
import requestLogger from './middlewares/requestLogger/requestLogger';
import notFoundRoutes from './routes/notFoundRoutes/notFoundRoutes';
import rootRoutes from './routes/rootRoutes/rootRoutes';
import userRoutes from './routes/userRoutes/userRoutes';
import logger from './utils/logger/logger';

// ------------------------------------------------------------------------------------------

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

// ------------------------------------------------------------------------------------------

const app = express();
const server = http.createServer(app);

// ------------------------------------------------------------------------------------------

app.use(rateLimiter);
app.use(requestLogger);
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

// ------------------------------------------------------------------------------------------

app.use(rootRoutes);
app.use(userRoutes);
app.use(notFoundRoutes);

// ------------------------------------------------------------------------------------------

(async () => {
	try {
		const PORT = process.env.PORT;
		if (!PORT) {
			throw new Error('PORT environment variable is not set.');
		}

		await connectDB();
		server.listen(PORT, () => {
			logger.info(
				`Speckvue users service backend is running on port ${PORT}.`,
			);
		});
	} catch (error) {
		logger.error(error);
		setTimeout(() => {
			process.exit(1);
		}, 1000);
	}
})();

// ------------------------------------------------------------------------------------------

const shutdown = async () => {
	try {
		await disconnectDB();
		logger.info('Speckvue users service backend has been closed.');
		setTimeout(() => {
			process.exit(0);
		}, 1000);
	} catch (error) {
		logger.error(error);
		setTimeout(() => {
			process.exit(1);
		}, 1000);
	}
};

// ------------------------------------------------------------------------------------------

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('uncaughtException', (error) => {
	logger.error(error);
	setTimeout(() => {
		process.exit(1);
	}, 1000);
});

process.on('unhandledRejection', (reason) => {
	logger.error(reason);
	setTimeout(() => {
		process.exit(1);
	}, 1000);
});

// ------------------------------------------------------------------------------------------
