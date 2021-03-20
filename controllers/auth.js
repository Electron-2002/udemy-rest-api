const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signUp = async (req, res, next) => {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			const error = new Error('Validation failed!');
			error.statusCode = 422;
			errors.data = errors.array();
			throw error;
		}

		const hashedPassword = await bcrypt.hash(req.body.password, 12);

		const user = new User({
			email: req.body.email,
			password: hashedPassword,
			name: req.body.name
		});

		const result = await user.save();

		res.status(201).json({
			message: 'User created successfully!',
			userId: result._id
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			const error = new Error('Validation failed!');
			error.statusCode = 422;
			errors.data = errors.array();
			throw error;
		}

		const user = await User.findOne({ email: req.body.email });

		if (!user) {
			const error = new Error('No such user found!');
			error.statusCode = 401;
			throw error;
		}

		const isEqual = await bcrypt.compare(req.body.password, user.password);

		if (!isEqual) {
			const error = new Error('Invalid password!');
			error.statusCode = 401;
			throw error;
		}

		const token = jwt.sign(
			{
				email: user.email,
				userId: user._id.toString()
			},
			'VeryVeryVerySuperSecretKey',
			{ expiresIn: '1h' }
		);

		res.status(201).json({
			token,
			userId: user._id
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
