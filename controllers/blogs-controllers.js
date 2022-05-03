const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const { cloudinary } = require('../config/cloudinary');

const Blog = require('../models/blog-model');
const User = require('../models/user-model');
const Comment = require('../models/comment-model');

// /api/blogs => GET
exports.getAllBlogs = async (req, res, next) => {
	let blogs;
	try {
		blogs = await Blog.find({})
			.populate('creator', 'name avatar')
			.sort({ updatedAt: -1 });
	} catch (err) {
		const error = new HttpError(
			'Get blog failed, please try again.',
			500
		);
		return next(error);
	}
	res.json({
		blogs: blogs.map((blog) => blog.toObject({ getters: true })),
	});
};

// /api/blogs => POST
exports.createBlog = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const firstError = errors.array({ onlyFirstError: true });

		return next(new HttpError(firstError[0].msg, 422));
	}

	const { title, description } = req.body;
	const createdBlog = new Blog({
		title,
		description,
		image: req.file.path,
		creator: req.userData.userId,
	});

	let user;
	try {
		user = await User.findById(req.userData.userId);
	} catch (err) {
		const error = new HttpError(
			'Creating blog failed, please try again.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'Could not find user for provided id',
			404
		);
		return next(error);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await createdBlog.save({ session: sess });
		user.blogs.push(createdBlog);
		await user.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Creating blog failed, please try again.',
			500
		);
		return next(error);
	}

	res.status(201).json({
		message: 'Blog created successfully!!',
		blog: createdBlog,
	});
};

// /api/blogs/:blogId => GET
exports.getBlogDetail = async (req, res, next) => {
	const blogId = req.params.blogId;

	let blog;
	try {
		blog = await Blog.findById(blogId)
			.populate('creator', 'name avatar')
			.populate({
				path: 'comments',
				populate: {
					path: 'creator',
					select: 'name avatar createdAt',
				},
			});
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not find a blog.',
			500
		);
		return next(error);
	}

	if (!blog) {
		return next(
			new HttpError('Could not find a blog for the provided id.', 404)
		);
	}

	res.json({ blog: blog.toObject({ getters: true }) });
};

// /api/blogs/:blogId/comments => GET
exports.getBlogDetailComments = async (req, res, next) => {
	const blogId = req.params.blogId;

	let blog;
	try {
		blog = await Blog.findById(blogId)
			.select('comments')
			.populate({
				path: 'comments',
				populate: {
					path: 'creator',
					select: 'name avatar createdAt',
				},
			});
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not find a blog.',
			500
		);
		return next(error);
	}

	if (!blog) {
		return next(
			new HttpError('Could not find a blog for the provided id.', 404)
		);
	}

	res.json({ blog: blog.toObject({ getters: true }) });
};

// /api/blogs/:blogId => PATCH
exports.updateBLOG = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const firstError = errors.array({ onlyFirstError: true });
		return next(new HttpError(firstError[0].msg, 422));
	}

	const { title, description } = req.body;
	const blogId = req.params.blogId;

	let updatedBlog;
	try {
		updatedBlog = await Blog.findById(blogId);
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not update a blog.',
			500
		);
		return next(error);
	}

	if (!updatedBlog.creator.equals(req.userData.userId)) {
		const error = new HttpError(
			'You are not allowed to edit this blog.',
			401
		);
		return next(error);
	}

	updatedBlog.title = title;
	updatedBlog.description = description;

	try {
		await updatedBlog.save();
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not save a blog.',
			500
		);
		return next(error);
	}

	res.status(200).json({
		blog: updatedBlog.toObject({ getters: true }),
		message: 'Blog updated successfully!!!',
	});
};

// /api/blogs/:blogId => DELETE
exports.deleteBLOG = async (req, res, next) => {
	const blogId = req.params.blogId;

	let blog;
	try {
		blog = await Blog.findById(blogId).populate('creator');
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not delete a blog.',
			500
		);
		return next(error);
	}

	if (!blog) {
		return next(
			new HttpError('Could not find a blog for that id.', 404)
		);
	}

	if (blog.creator.id !== req.userData.userId) {
		const error = new HttpError(
			'You are not allowed to delete this blog.',
			401
		);
		return next(error);
	}

	const imagePath = blog.image;

	// Cloudinary can not delete image from URL. The function retrive filename.
	const getPublicId = (imageURL) =>
		imageURL.split('/').pop().split('.')[0];

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await blog.remove({ session: sess });
		blog.creator.blogs.pull(blog);
		await blog.creator.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not delete a blog.',
			500
		);
		return next(error);
	}

	try {
		// Cloudinary needs to know public id (FolderName/Filename) for delete image.
		await cloudinary.uploader.destroy(
			`MERN-BLOG/${getPublicId(imagePath)}`
		);
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not delete a image.',
			500
		);
		return next(error);
	}

	res.status(200).json({ message: 'Blog deleted successfully!!' });
};

// /api/blogs/:blogId/comment => POST
exports.createComment = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const firstError = errors.array({ onlyFirstError: true });
		return next(new HttpError(firstError[0].msg, 422));
	}

	let blog;
	try {
		blog = await Blog.findById(req.params.blogId);
	} catch (err) {
		const error = new HttpError('Sorry, blog not found.', 404);
		return next(error);
	}

	let user;
	try {
		user = await User.findById(req.userData.userId);
	} catch (err) {
		const error = new HttpError(
			'Creating blog failed, please try again.',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError(
			'Could not find user for provided id',
			404
		);
		return next(error);
	}

	const createdComment = new Comment({
		comment: req.body.comment,
		creator: req.userData.userId,
		blog: req.params.blogId,
		responseTo: req.body.responseTo,
	});

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await createdComment.save({ session: sess });
		user.comments.push(createdComment);
		blog.comments.push(createdComment);
		await user.save({ session: sess });
		await blog.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Creating blog failed, please try again.',
			500
		);
		return next(error);
	}

	res.status(200).json({ comment: createdComment });
};

// /api/blogs/:blogId/comment/:commentId => DELETE
exports.deleteComment = async (req, res, next) => {
	const commentId = req.params.commentId;

	let blog;
	try {
		blog = await Blog.findById(req.params.blogId);
	} catch (err) {
		const error = new HttpError('Sorry, blog not found.', 404);
		return next(error);
	}

	let comment;
	try {
		comment = await Comment.findById(commentId)
			.populate('creator')
			.populate('blog');
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not delete a comment.',
			500
		);
		return next(error);
	}

	if (!comment) {
		return next(
			new HttpError('Could not find a comment for that id.', 404)
		);
	}

	if (comment.creator.id !== req.userData.userId) {
		const error = new HttpError(
			'You are not allowed to delete this comment.',
			401
		);
		return next(error);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await comment.remove({ session: sess });
		comment.creator.blogs.pull(comment);
		comment.creator.comments.pull(comment);
		blog.comments.pull(comment);
		await blog.save({ session: sess });
		await comment.creator.save({ session: sess });
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not delete a comment.',
			500
		);
		return next(error);
	}

	res.status(200).json({ message: 'Comment deleted successfully!!' });
};
