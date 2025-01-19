// ------------------------------------------------------------------------------------------

import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { isValidObjectId, ObjectId, Types } from 'mongoose';
import validator from 'validator';

import CookieName from '../../constants/cookieNames/cookieNames';
import User from '../../models/userModel/userModel';
import { uploadFile } from '../../services/files/files';
import asyncHandler from '../../utils/asyncHandler/asyncHandler';
import { decryptPublicData } from '../../utils/cryptography/cryptography';
import logger from '../../utils/logger/logger';
import randomString from '../../utils/randomString/randomString';
import { createAccessToken, createRefreshToken } from '../../utils/tokens/tokens';

// ------------------------------------------------------------------------------------------

let tempSignUpToken: string = randomString(4);

// ------------------------------------------------------------------------------------------

export const createUser = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const userId = null;
		const {
			firstName,
			middleName,
			lastName,
			dateOfBirth,
			email,
			password,
			signUpToken,
		} = req.body;

		if (!firstName) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'First name is required.',
			});
			return;
		} else if (!validator.isAlpha(firstName, 'en-US', { ignore: ' ' })) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'First name is invalid.',
			});
			return;
		}

		if (!email) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'Email is required.',
			});
			return;
		} else if (!validator.isEmail(email)) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'Email is invalid.',
			});
			return;
		}

		const decryptedPassword = password && decryptPublicData(password);

		if (!password) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'Password is required.',
			});
			return;
		} else if (
			!decryptedPassword ||
			!validator.isStrongPassword(decryptedPassword, {
				minLength: 8,
				minLowercase: 1,
				minUppercase: 1,
				minNumbers: 1,
				minSymbols: 1,
			})
		) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description:
					'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.',
			});
			return;
		}

		if (!signUpToken) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'Sign up token is required.',
			});
			return;
		} else if (signUpToken !== tempSignUpToken) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'Sign up token is invalid.',
			});
			return;
		}

		const existingUser = await User.findOne({ 'data.email': email });
		if (existingUser) {
			res.status(409).json({
				success: false,
				message: 'Conflict.',
				description: 'User with this email already exists.',
			});
			return;
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(decryptedPassword, salt);

		const newUser: User = new User({
			data: {
				firstName,
				middleName,
				lastName,
				dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
				email,
				password: hashedPassword,
			},
			status: {
				disabled: false,
				deleted: false,
			},
		});

		let avatarData = null;

		if (req.file) {
			try {
				avatarData = await uploadFile(
					req.file,
					{
						_id: newUser._id as ObjectId,
					},
					{ resize: { height: 500, width: 500 } },
				);
				newUser.data.avatarId = avatarData._id as Types.ObjectId;
			} catch (error) {
				logger.error(error);
			}
		}

		await newUser.create(userId);

		tempSignUpToken = randomString(4);

		const accessToken = createAccessToken({
			_id: newUser._id as ObjectId,
		});
		const refreshToken = createRefreshToken({
			_id: newUser._id as ObjectId,
		});

		const ACCESS_TOKEN_EXPIRATION_MS =
			process.env.ACCESS_TOKEN_EXPIRATION_MS;
		if (!ACCESS_TOKEN_EXPIRATION_MS) {
			throw new Error(
				'ACCESS_TOKEN_EXPIRATION_MS environment variable is not set.',
			);
		}

		const REFRESH_TOKEN_EXPIRATION_MS =
			process.env.REFRESH_TOKEN_EXPIRATION_MS;
		if (!REFRESH_TOKEN_EXPIRATION_MS) {
			throw new Error(
				'REFRESH_TOKEN_EXPIRATION_MS environment variable is not set.',
			);
		}

		res.cookie(CookieName.AccessToken, accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: +ACCESS_TOKEN_EXPIRATION_MS,
			sameSite: 'lax',
		});

		res.cookie(CookieName.RefreshToken, refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: +REFRESH_TOKEN_EXPIRATION_MS,
			sameSite: 'lax',
		});

		res.status(201).json({
			success: true,
			message: 'Created.',
			description: 'User created successfully.',
			user: {
				_id: newUser._id,
			},
		});
		return;
	},
);

// ------------------------------------------------------------------------------------------

export const signInUser = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { email, password } = req.body;

		if (!email) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'Email is required.',
			});
			return;
		} else if (!validator.isEmail(email)) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'Email is invalid.',
			});
			return;
		}

		const decryptedPassword = password && decryptPublicData(password);

		if (!password) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'Password is required.',
			});
			return;
		} else if (
			!decryptedPassword ||
			!validator.isStrongPassword(decryptedPassword, {
				minLength: 8,
				minLowercase: 1,
				minUppercase: 1,
				minNumbers: 1,
				minSymbols: 1,
			})
		) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description:
					'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.',
			});
			return;
		}

		const existingUser = await User.findOne({ 'data.email': email });
		if (!existingUser) {
			res.status(401).json({
				success: false,
				message: 'Unauthorized.',
				description: 'Invalid credentials.',
			});
			return;
		}

		const isMatch = await bcrypt.compare(
			decryptedPassword,
			existingUser.data.password,
		);
		if (!isMatch) {
			res.status(401).json({
				success: false,
				message: 'Unauthorized.',
				description: 'Invalid credentials.',
			});
			return;
		}

		const accessToken = createAccessToken({
			_id: existingUser._id as ObjectId,
		});
		const refreshToken = createRefreshToken({
			_id: existingUser._id as ObjectId,
		});

		const ACCESS_TOKEN_EXPIRATION_MS =
			process.env.ACCESS_TOKEN_EXPIRATION_MS;
		if (!ACCESS_TOKEN_EXPIRATION_MS) {
			throw new Error(
				'ACCESS_TOKEN_EXPIRATION_MS environment variable is not set.',
			);
		}

		const REFRESH_TOKEN_EXPIRATION_MS =
			process.env.REFRESH_TOKEN_EXPIRATION_MS;
		if (!REFRESH_TOKEN_EXPIRATION_MS) {
			throw new Error(
				'REFRESH_TOKEN_EXPIRATION_MS environment variable is not set.',
			);
		}

		res.cookie(CookieName.AccessToken, accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: +ACCESS_TOKEN_EXPIRATION_MS,
			sameSite: 'lax',
		});

		res.cookie(CookieName.RefreshToken, refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: +REFRESH_TOKEN_EXPIRATION_MS,
			sameSite: 'lax',
		});

		res.status(200).json({
			success: true,
			message: 'Authenticated.',
			description: 'User signed in successfully.',
			user: {
				_id: existingUser._id,
			},
		});
	},
);

// ------------------------------------------------------------------------------------------

export const signOutUser = asyncHandler(
	async (_req: Request, res: Response): Promise<void> => {
		res.clearCookie(CookieName.AccessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		});

		res.clearCookie(CookieName.RefreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		});

		res.status(200).json({
			success: true,
			message: 'OK.',
			description: 'User signed out successfully.',
		});
		return;
	},
);

// ------------------------------------------------------------------------------------------

export const checkEmailExists = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { email } = req.body;

		if (!email) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'Email is required.',
			});
			return;
		} else if (!validator.isEmail(email)) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'Email is invalid.',
			});
			return;
		}

		const existingUser = await User.findOne({ 'data.email': email });
		if (existingUser) {
			res.status(200).json({
				success: true,
				message: 'OK.',
				description: 'User with this email already exists.',
			});
			return;
		} else {
			res.status(404).json({
				success: false,
				message: 'Not found.',
				description: 'No user found with this email.',
			});
			return;
		}
	},
);

// ------------------------------------------------------------------------------------------

export const getSignUpToken = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { email, password } = req.query;

		if (!email) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'Email is required.',
			});
			return;
		} else if (!validator.isEmail(email.toString())) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'Email is invalid.',
			});
			return;
		}

		if (!password) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'Password is required.',
			});
			return;
		} else if (
			!validator.isStrongPassword(password.toString(), {
				minLength: 8,
				minLowercase: 1,
				minUppercase: 1,
				minNumbers: 1,
				minSymbols: 1,
			})
		) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description:
					'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.',
			});
			return;
		}

		const existingUser = await User.findOne({
			'data.email': email.toString(),
		});
		if (!existingUser) {
			res.status(401).json({
				success: false,
				message: 'Unauthorized.',
				description: 'Invalid credentials.',
			});
			return;
		}

		const isMatch = await bcrypt.compare(
			password.toString(),
			existingUser.data.password,
		);
		if (!isMatch) {
			res.status(401).json({
				success: false,
				message: 'Unauthorized.',
				description: 'Invalid credentials.',
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: 'OK.',
			description: 'Sign up token retrieved successfully.',
			user: { signUpToken: tempSignUpToken },
		});
		return;
	},
);

// ------------------------------------------------------------------------------------------

export const getCurrentUser = asyncHandler(
	async (req: Request, res: Response): Promise<void> => {
		const { _id } = req.body.user;

		if (!_id) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'User ID is required.',
			});
			return;
		} else if (!isValidObjectId(_id)) {
			res.status(400).json({
				success: false,
				message: 'Bad request.',
				description: 'User ID is invalid.',
			});
			return;
		}

		const user = await User.findById(_id).select('-data.password');

		if (!user || user.status.disabled || user.status.deleted) {
			res.status(404).json({
				success: false,
				message: 'Not found.',
				description: 'User not found.',
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: 'OK.',
			description: 'User details retrieved successfully.',
			user: {
				_id: user._id,
				firstName: user.data.firstName,
				middleName: user.data.middleName,
				lastName: user.data.lastName,
				email: user.data.email,
				dateOfBirth: user.data.dateOfBirth,
				avatarId: user.data.avatarId,
			},
		});
	},
);

// ------------------------------------------------------------------------------------------
