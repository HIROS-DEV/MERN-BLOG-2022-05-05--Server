const router = require('express').Router();
const { check } = require('express-validator');

const {
	getAllBlogs,
	getBlogDetail,
	getBlogDetailComments,
	createBlog,
	updateBLOG,
	deleteBLOG,
	createComment,
	deleteComment,
} = require('../controllers/blogs-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

router.get('/', getAllBlogs);

router.get('/:blogId', getBlogDetail);
router.get('/:blogId/comments', getBlogDetailComments);

router.use(checkAuth);

router.post(
	'/',
	fileUpload.single('image'),
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
				'Description must be more than 5 characters'
			),
	],
	createBlog
);

router.post(
	'/:blogId/comment',
	[
		check('comment')
			.not()
			.isEmpty()
			.withMessage('Comment must not be empty.')
			.isLength({ max: 200, min: 2 })
			.withMessage('Comment must be more than 2 and less than 500 characters.'),
	],
	createComment
);

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
				'Description must be more than 5 characters'
			),
	],
	updateBLOG
);

router.delete('/:blogId', deleteBLOG);
router.delete('/:blogId/comment/:commentId', deleteComment);

module.exports = router;