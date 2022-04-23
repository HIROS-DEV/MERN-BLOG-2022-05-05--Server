require('colors');

const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const blogsRoutes = require('./routes/blogs.routes');
const authRoutes = require('./routes/auth.routes');

const HttpError = require('./models/http-error');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(bodyParser.json());
app.use(
	'/uploads/images',
	express.static(path.join('uploads', 'images'))
);

app.use((req, res, next) => {
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

app.use((req, res, next) => {
	const error = new HttpError('Could not find this routes.', 404);
	throw error;
});

app.use((error, req, res, next) => {
	/*****  When image upload failed, image don't save upload folder *****/
	if (req.file) {
		fs.unlink(req.file.path, (err) => {
			console.log(err);
		});
	}
	/*********************************************************************/

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
