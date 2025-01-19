// ------------------------------------------------------------------------------------------

declare namespace NodeJS {
	interface ProcessEnv {
		readonly NODE_ENV: 'development' | 'production' | 'test';
		readonly PORT: string;
		readonly DATABASE_URL: string;
		readonly ALLOWED_ORIGINS: string;
		readonly FILES_SERVICE_BASE_URL: string;
		readonly ACCESS_TOKEN_SECRET: string;
		readonly ACCESS_TOKEN_EXPIRATION_MS: string;
		readonly REFRESH_TOKEN_SECRET: string;
		readonly REFRESH_TOKEN_EXPIRATION_MS: string;
		readonly PRIVATE_ENCRYPTION_SECRET_KEY: string;
		readonly PUBLIC_ENCRYPTION_SECRET_KEY: string;
	}
}

// ------------------------------------------------------------------------------------------
