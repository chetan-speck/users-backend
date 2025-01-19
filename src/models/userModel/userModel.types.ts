// ------------------------------------------------------------------------------------------

import { Document, Types } from 'mongoose';

// ------------------------------------------------------------------------------------------

export interface User extends Document {
	data: {
		firstName: string;
		middleName: string | null;
		lastName: string | null;
		dateOfBirth: Date | null;
		email: string;
		password: string;
		avatarId: Types.ObjectId | null;
	};
	status: {
		disabled: boolean;
		deleted: boolean;
	};
	metadata: {
		createdAt: Date;
		createdBy: Types.ObjectId | null;
		updatedAt: Date;
		updatedBy: Types.ObjectId | null;
	};
	create: (userId: Types.ObjectId | null) => void;
	update: (userId: Types.ObjectId | null) => void;
	delete: (userId: Types.ObjectId | null) => void;
	restore: (userId: Types.ObjectId | null) => void;
}

// ------------------------------------------------------------------------------------------
