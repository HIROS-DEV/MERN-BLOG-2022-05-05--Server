const { Schema, model } = require('mongoose');

const commentSchema = new Schema(
	{
		creator: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		blog: {
			type: Schema.Types.ObjectId,
			ref: 'Blog',
		},
		responseTo: {
			type: String,
		},
		comment: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

module.exports = model('Comment', commentSchema);
