const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user-model');


const axios = require('axios');

function getRequestParams(email) {
	const API_KEY = process.env.MAILCHIMP_API_KEY;
	const LIST_ID = process.env.MAILCHIMP_LIST_ID;
	const DATACENTER = process.env.MAILCHIMP_API_KEY.split('-')[1];

	const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;

	const data = {
		email_address: email,
		status: 'pending',
	};

	const base64ApiKey = Buffer.from(`anystring:${API_KEY}`).toString(
		'base64'
	);
	const headers = {
		'Content-Type': 'application/json',
		Authorization: `Basic ${base64ApiKey}`,
	};

	return {
		url,
		data,
		headers,
	};
}


// /api/auth/signup => POST
exports.signup = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const firstError = errors.array({ onlyFirstError: true });
		return next(new HttpError(firstError[0].msg, 422));
	}

	const { name, email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email });
	} catch (err) {
		const error = new HttpError(
			'Signing up failed, please try again',
			500
		);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError(
			'User exists already, please login.',
			422
		);
		return next(error);
	}

	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (err) {
		const error = new HttpError(
			'Something happened during password hashed, please try again.',
			500
		);
		return next(error);
	}

	const createdUser = new User({
		name,
		email,
		password: hashedPassword,
		avatar: req.file.path,
		blogs: [],
	});

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError(
			'Signing up failed, please try again.',
			500
		);
		return next(error);
	}

	let token;
	try {
		token = jwt.sign(
			{ userId: createdUser.id, email: createdUser.email },
			process.env.JWT_SECRET,
			{ expiresIn: '1h' }
		);
	} catch (err) {
		const error = new HttpError(
			'Signing up failed, please try again.',
			500
		);
		return next(error);
	}

	res.status(201).json({
		message: 'User created successfully!!!',
		userId: createdUser.id,
		email: createdUser.email,
		token: token,
	});
};

// /api/auth/login => POST
exports.login = async (req, res, next) => {
	const { email, password } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email });
	} catch (err) {
		const error = new HttpError(
			'Logging in failed, please try again',
			500
		);
		return next(error);
	}

	if (!existingUser) {
		return next(
			new HttpError(
				'Could not identify user. Email or Password does not match.',
				401
			)
		);
	}

	let matchPassword;

	try {
		matchPassword = await bcrypt.compare(
			password,
			existingUser.password
		);
	} catch (error) {
		return next(
			new HttpError('Something went wrong, please login again.', 500)
		);
	}

	if (!matchPassword) {
		return next(
			new HttpError(
				'Could not identify user. Email or Password does not match.',
				401
			)
		);
	}

	let token;
	try {
		token = jwt.sign(
			{ userId: existingUser.id, email: existingUser.email },
			process.env.JWT_SECRET,
			{ expiresIn: '1h' }
		);
	} catch (err) {
		const error = new HttpError(
			'Logging in failed, please try again.',
			500
		);
		return next(error);
	}

	res.json({
		message: 'Log in successfully!!!',
		// user: existingUser.toObject({ getters: true }),
		userId: existingUser.id,
		email: existingUser.email,
		token: token,
	});
};

// /api/newsletter => POST
exports.subscribeNewsletter = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const firstError = errors.array({ onlyFirstError: true });
		return next(new HttpError(firstError[0].msg, 422));
	}

	const { email } = req.body;

	try {
		const { url, data, headers } = getRequestParams(email);

		try {
			await axios.post(url, data, { headers });
		} catch (err) {
			return res.status(400).json({
				err: `Something went wrong. Perhaps, you subscribed newsletter already or you entered invalid email address. I used mailchimp service. And, mailchimp can not accept spam address (ex: test@gmail.com etc,etc...)`,
			});
		}

		return res.status(201).json({
			error: null,
			message:
				'I sended email for your address. Please check your inbox and confirm subscription.',
		});
	} catch (error) {
		return res.status(400).json({
			error: `Something went wrong. Perhaps, you subscribed newsletter already or you entered invalid email address. I used mailchimp service. And, mailchimp can not accept spam address (ex: test@gmail.com etc,etc...)`,
		});
	}
};
