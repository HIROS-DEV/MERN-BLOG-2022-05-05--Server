const multer = require('multer');
// const uuid = require('uuid').v1;

const { storage } = require('../config/cloudinary');

const MIME_TYPE_MAP = {
	'image/png': 'png',
	'image/jpeg': 'jpeg',
	'image/jpg': 'jpg',
};

const fileUpload = multer({
	limits: 500000,
	/******** MongoDB + Local Img Storage ********/
	// storage: multer.diskStorage({
	// 	destination: (req, file, cb) => {
	// 		cb(null, 'uploads/images');
	// 	},
	// 	filename: (req, file, cb) => {
	// 		const ext = MIME_TYPE_MAP[file.mimetype];
	// 		cb(null, uuid() + '.' + ext);
	// 	},
	// }),
	/**********************************************/
	/******** MongoDB + Cloudinary Storage*********/
	storage: storage,
	/**********************************************/
	fileFilter: (req, file, cb) => {
		const isValid = !!MIME_TYPE_MAP[file.mimetype];
		let error = isValid ? null : new Error('Invalid mime type!');
		cb(error, isValid);
	},
});

module.exports = fileUpload;
