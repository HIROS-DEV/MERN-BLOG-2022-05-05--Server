const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const mongoose = require('mongoose');

const Blog = require('../models/blog-model');
const User = require('../models/user-model');

// /api/blogs => GET
exports.getAllBlogs = async (req, res, next) => {
	let blogs;
	try {
		blogs = await Blog.find({}).populate('creator', 'name').sort({updatedAt:-1});
	} catch (err) {
		const error = new HttpError(
			'Get blog failed, please try again.',
			500
		);
		return next(error);
	}
	res.json({ blogs: blogs.map(blog => blog.toObject({ getters: true })) });
};

// /api/blogs => POST
exports.createBlog = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const firstError = errors.array({ onlyFirstError: true });
		return next(new HttpError(firstError[0].msg, 422));
	}

	const { title, description, creator } = req.body;
	const createdBlog = new Blog({
		title,
		description,
		image:
			'https://images.unsplash.com/photo-1507297448044-a99b358cd06e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1568&q=80',
		creator,
	});

	let user;
	try {
		user = await User.findById(creator);
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
			.populate('creator', 'name avatar');
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

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await blog.remove({ session: sess });
		blog.creator.blogs.pull(blog);
		await blog.creator.save({session: sess});
		await sess.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not delete a blog.',
			500
		);
		return next(error);
	}

	res.status(200).json({ message: 'Blog deleted successfully!!' });
};
