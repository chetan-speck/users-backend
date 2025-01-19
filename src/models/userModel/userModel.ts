// ------------------------------------------------------------------------------------------

import { model, Schema, Types } from 'mongoose';

import type { User } from './userModel.types';

// ------------------------------------------------------------------------------------------

const userSchema = new Schema<User>({
	data: {
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		middleName: {
			type: String,
			default: null,
			trim: true,
		},
		lastName: {
			type: String,
			default: null,
			trim: true,
		},
		dateOfBirth: {
			type: Date,
			default: null,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
		},
		avatarId: {
			type: Schema.Types.ObjectId,
			ref: 'Files',
			default: null,
		},
	},
	status: {
		disabled: {
			type: Boolean,
			default: false,
		},
		deleted: {
			type: Boolean,
			default: false,
		},
	},
	metadata: {
		createdAt: {
			type: Date,
			default: Date.now,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			default: null,
		},
		updatedAt: {
			type: Date,
			default: Date.now,
		},
		updatedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			default: null,
		},
	},
});

// ------------------------------------------------------------------------------------------

userSchema.methods.create = async function (userId: Types.ObjectId) {
	this.metadata.createdAt = new Date();
	this.metadata.createdBy = userId;
	this.metadata.updatedAt = new Date();
	this.metadata.updatedBy = userId;
	await this.save();
};

userSchema.methods.update = async function (userId: Types.ObjectId) {
	this.metadata.updatedAt = new Date();
	this.metadata.updatedBy = userId;
	await this.save();
};

userSchema.methods.delete = async function (userId: Types.ObjectId) {
	this.status.deleted = true;
	this.metadata.updatedAt = new Date();
	this.metadata.updatedBy = userId;
	await this.save();
};

userSchema.methods.restore = async function (userId: Types.ObjectId) {
	this.status.deleted = false;
	this.metadata.updatedAt = new Date();
	this.metadata.updatedBy = userId;
	await this.save();
};

// ------------------------------------------------------------------------------------------

const User = model<User>('User', userSchema);

// ------------------------------------------------------------------------------------------

export default User;

// ------------------------------------------------------------------------------------------
