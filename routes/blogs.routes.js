const router = require('express').Router();
const { check } = require('express-validator');

const {
	getAllBlogs,
	getBlogDetail,
	createBlog,
	updateBLOG,
	deleteBLOG,
} = require('../controllers/blogs-controllers');

router.get('/', getAllBlogs);
router.post(
	'/',
	[
		check('title')
			.not()
			.isEmpty()
			.withMessage('Title must not be empty.')
			.isLength({ max: 50 })
			.withMessage('Title must be less than 50 characters'),
		check('description')
			.not()
			.isEmpty()
			.withMessage('Description must not be empty.')
			.isLength({ max: 300000, min: 5 })
			.withMessage(
				'Description must be more than 5 characters and less than 300000'
			),
	],
	createBlog
);

router.get('/:blogId', getBlogDetail);
router.patch(
	'/:blogId',
	[
		check('title')
			.not()
			.isEmpty()
			.withMessage('Title must not be empty.')
			.isLength({ max: 50 })
			.withMessage('Title must be less than 50 characters'),
		check('description')
			.not()
			.isEmpty()
			.withMessage('Description must not be empty.')
			.isLength({ max: 300000, min: 5 })
			.withMessage(
				'Description must be more than 5 characters and less than 300000'
			),
	],
	updateBLOG
);
router.delete('/:blogId', deleteBLOG);

module.exports = router;
