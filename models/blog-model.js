const { Schema, model } = require('mongoose');

const blogSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			maxlength: 50,
			trim: true,
		},
		description: {
			type: String,
			required: true,
			maxlength: 300000,
			minlength: 5,
			trim: true,
		},
		image: {
			type: String,
			required: true,
			trim: true,
		},
		creator: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
		comments: [
			{
				type: Schema.Types.ObjectId,
				required: true,
				ref: 'Comment',
			},
		],
	},
	{ timestamps: true }
);

module.exports = model('Blog', blogSchema);
