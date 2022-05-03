const router = require('express').Router();
const { check } = require('express-validator');


const {
	subscribeNewsletter,
	contact
} = require('../controllers/newsletter-controller');

router.post(
	'/newsletter',
	check('email')
		.not()
		.isEmpty()
		.withMessage('Email must not be empty.')
		.normalizeEmail()
		.isEmail()
		.withMessage('Please enter valid an email address')
		.isLength({ max: 200 })
		.withMessage('Email must be within 200 characters')
		.toLowerCase(),
	subscribeNewsletter
);

router.post(
	'/contact',
	[
		check('name')
			.not()
			.isEmpty()
			.withMessage('Name must not be empty.')
			.isLength({ max: 50 })
			.withMessage('Name must be less than 50 characters')
			.trim(),
		check('email')
			.not()
			.isEmpty()
			.withMessage('Email must not be empty.')
			.normalizeEmail()
			.isEmail()
			.withMessage('Please enter valid an email address')
			.isLength({ max: 200 })
			.withMessage('Email must be within 200 characters')
			.toLowerCase(),
		check('subject')
			.not()
			.isEmpty()
			.withMessage('Subject must not be empty.')
			.isLength({ max: 50 })
			.withMessage('Subject must be less than 50 characters')
			.trim(),
		check('message')
			.not()
			.isEmpty()
			.withMessage('Message must not be empty.')
			.isLength({ max: 3000})
			.withMessage('Message must be less than 3000 characters.'),
	],
	contact
);

module.exports = router;
