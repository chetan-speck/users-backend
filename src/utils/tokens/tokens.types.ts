// ------------------------------------------------------------------------------------------

import { JwtPayload } from 'jsonwebtoken';
import { ObjectId } from 'mongoose';

// ------------------------------------------------------------------------------------------

export interface AccessTokenPayload extends JwtPayload {
	_id: ObjectId;
}

export interface RefreshTokenPayload extends JwtPayload {
	_id: ObjectId;
}

// ------------------------------------------------------------------------------------------
