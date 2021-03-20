const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.put(
	'/signup',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid E-Mail')
			.custom(async (value, { req }) => {
				const user = await User.findOne({ email: value });

				if (user) {
					return Promise.reject('E-Mail ID already exists!');
				}
			})
			.normalizeEmail(),
		body('password').trim().isLength({
			min: 5
		}),
		body('name').trim().not().isEmpty()
	],
	authController.signUp
);

router.post(
	'/login',
	body('email')
		.isEmail()
		.withMessage('Please enter a valid E-Mail')
		.normalizeEmail(),
	body('password').trim().isLength({
		min: 5
	}),
	authController.login
);

module.exports = router;
