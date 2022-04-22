const { Schema, model } = require('mongoose');

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			maxlength: 50,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			maxlength: 200,
			trim: true,
			unique: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			maxlength: 30000,
			minlength: 6,
		},
		avatar: {
			type: String,
			required: true,
			trim: true,
		},
		blogs: [
			{
				type: Schema.Types.ObjectId,
				required: true,
				ref: 'Blog',
			},
		],
	},
	{ timestamps: true }
);

module.exports = model('User', userSchema);
