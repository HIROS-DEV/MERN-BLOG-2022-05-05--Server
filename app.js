require('colors');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { cloudinary } = require('./config/cloudinary');

const blogsRoutes = require('./routes/blogs.routes');
const authRoutes = require('./routes/auth.routes');
const newsLetterRoutes = require('./routes/newsletter.routes');

const HttpError = require('./models/http-error');

const PORT = process.env.PORT || 8080;

const app = express();

app.use(bodyParser.json());
app.use(
	'/uploads/images',
	express.static(path.join('uploads', 'images'))
);

app.use((_req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PATCH, DELETE'
	);
	next();
});

app.use('/api/blogs', blogsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', newsLetterRoutes);

app.use((_req, _res, _next) => {
	const error = new HttpError('Could not find this routes.', 404);
	throw error;
});

app.use(async (error, req, res, next) => {
	if (req.file) {
		try {
			const imagePath = req.file.path.split('/').pop().split('.')[0];
			await cloudinary.uploader.destroy(`MERN-BLOG/${imagePath}`);
		} catch (error) {
			return next(error);
		}
	}

	if (res.headersSent) {
		return next(error);
	}
	res.status(error.code || 500).json({
		message: error.message || 'An unknown error occurred!!',
	});
});

mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.nzsoj.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
	)
	.then(
		app.listen(PORT, () => {
			console.log(
				`Server is running on port ${PORT} & DB connected`.blue
			);
		})
	)
	.catch((err) => {
		console.log(`${err.message}`.red);
	});
