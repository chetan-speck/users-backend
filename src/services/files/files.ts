// ------------------------------------------------------------------------------------------

import axios from 'axios';
import FormData from 'form-data';
import { Types } from 'mongoose';

import CookieName from '../../constants/cookieNames/cookieNames';
import { filesUrl } from '../../constants/urls/urls';
import { createAccessToken } from '../../utils/tokens/tokens';
import { AccessTokenPayload, RefreshTokenPayload } from '../../utils/tokens/tokens.types';

// ------------------------------------------------------------------------------------------

export const uploadFile = async (
	file: Express.Multer.File,
	user: AccessTokenPayload & RefreshTokenPayload,
	options?: { resize?: { width?: number; height?: number } },
): Promise<{
	_id: Types.ObjectId;
}> => {
	const FILES_SERVICE_BASE_URL = process.env.FILES_SERVICE_BASE_URL;
	if (!FILES_SERVICE_BASE_URL) {
		throw new Error(
			'FILES_SERVICE_BASE_URL environment variable is not set.',
		);
	}

	if (!file || !file.buffer) {
		throw new Error('File not found.');
	}

	const accessToken = createAccessToken({ _id: user._id });
	const refreshToken = createAccessToken({ _id: user._id });

	const formData = new FormData();
	formData.append('file', file.buffer, file.originalname);
	if (options?.resize?.height) {
		formData.append('height', options?.resize?.height);
	}
	if (options?.resize?.width) {
		formData.append('width', options?.resize?.width);
	}

	const url = `${FILES_SERVICE_BASE_URL}${filesUrl.uploadFile}`;
	const response = await axios.post(url, formData, {
		headers: {
			...formData.getHeaders(),
			Cookie: `${CookieName.AccessToken}=${accessToken}; ${CookieName.RefreshToken}=${refreshToken}; HttpOnly; Secure;`,
		},
	});

	if (response.status !== 200 || !response.data.success) {
		throw new Error('Failed to upload file.');
	}

	return {
		_id: response.data.file._id,
	};
};

// ------------------------------------------------------------------------------------------
