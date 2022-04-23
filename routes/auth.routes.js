const router = require('express').Router();
const { check } = require('express-validator');

const { signup, login } = require('../controllers/auth-controllers');
const fileUpload = require('../middleware/file-upload');

router.post(
	'/signup',
	fileUpload.single('avatar'),
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
		check('password')
			.not()
			.isEmpty()
			.withMessage('Password must not be empty.')
			.isLength({ max: 30000, min: 6 })
			.withMessage('Password must be more than 6 characters.'),
	],
	signup
);
router.post('/login', login);

module.exports = router;
