const multer = require('multer');
const { storage } = require('../config/cloudinary');

const MIME_TYPE_MAP = {
	'image/png': 'png',
	'image/jpeg': 'jpeg',
	'image/jpg': 'jpg',
};

const fileUpload = multer({
	limits: 500000,
	storage: storage,
	fileFilter: (req, file, cb) => {
		const isValid = !!MIME_TYPE_MAP[file.mimetype];
		let error = isValid ? null : new Error('Invalid mime type!');
		cb(error, isValid);
	},
});

module.exports = fileUpload;
