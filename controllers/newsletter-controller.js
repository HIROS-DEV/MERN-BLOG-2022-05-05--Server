const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const axios = require('axios');

const HttpError = require('../models/http-error');
const getRequestParams = require('../config/mailchimp');

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
			const error = new HttpError(
				'Something went wrong. Perhaps, you subscribed newsletter already or you entered invalid email address.',
				400
			);
			return next(error);
		}

		return res.status(201).json({
			message:
				'I sended email for your address. Please check your inbox and confirm subscription.',
		});
	} catch (err) {
		const error = new HttpError(
			'Something went wrong. Perhaps, you subscribed newsletter already or you entered invalid email address.',
			400
		);
		return next(error);
	}
};

exports.contact = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const firstError = errors.array({ onlyFirstError: true });
		return next(new HttpError(firstError[0].msg, 422));
	}

	const { name, email, subject, message } = req.body;
	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		auth: {
			user: process.env.CONTACTFORM_USER,
			pass: process.env.CONTACTFORM_PASSWORD,
		},
	});

	const mailOptions = {
		from: email,
		to: process.env.CONTACTFORM_USER,
		subject: `Message from ${name} ${email}: ${subject}`,
		text: message,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return res.status(400).json({ error: error.message });
		} else {
			return res.json({
				message: 'Thank you for sending email. I will reply later.',
			});
		}
	});
};
