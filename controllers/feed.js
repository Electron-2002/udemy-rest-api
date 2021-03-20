const { validationResult } = require('express-validator');
const { clearImage } = require('../helpers/image');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
	try {
		const currPage = req.query.page || 1;
		const ITEMS_PER_PAGE = 2;

		const totalItems = await Post.find().countDocuments();

		const posts = await Post.find()
			.skip((currPage - 1) * ITEMS_PER_PAGE)
			.limit(ITEMS_PER_PAGE)
			.populate('creator');

		res.status(200).json({
			message: 'Posts fetched successfully!',
			posts,
			totalItems
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.createPost = async (req, res, next) => {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			const error = new Error(
				'Validation failed, entered data is incorrect!'
			);
			error.statusCode = 422;
			throw error;
		}

		if (!req.file) {
			const error = new Error('Image not provided!');
			error.statusCode = 422;
			throw error;
		}

		const post = new Post({
			title: req.body.title,
			content: req.body.content,
			imageUrl: req.file.path,
			creator: req.userId
		});

		const result = await post.save();

		console.log(result);

		const user = await User.findById(req.userId);

		user.posts.push(post);

		await user.save();

		res.status(201).json({
			message: 'Post created successfully!',
			post: result,
			creator: {
				_id: user._id,
				name: user.name
			}
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getPost = async (req, res, next) => {
	try {
		const postId = req.params.postId;

		const post = await Post.findById(postId);

		if (!post) {
			const error = new Error('No such post exists!');
			error.statusCode = 404;
			throw error;
		}

		res.status(200).json({
			message: 'Post fetched successfully!',
			post
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.updatePost = async (req, res, next) => {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			const error = new Error(
				'Validation failed, entered data is incorrect!'
			);
			error.statusCode = 422;
			throw error;
		}

		const postId = req.params.postId;

		const imageUrl = req.file ? req.file.path : req.body.image;

		if (!imageUrl) {
			const error = new Error('No image picked!');
			error.statusCode = 422;
			throw error;
		}

		const post = await Post.findById(postId);

		if (!post) {
			const error = new Error('No post found!');
			error.statusCode = 404;
			throw error;
		}

		if (post.creator.toString() !== req.userId) {
			const error = new Error('Not Authorized!');
			error.statusCode = 403;
			throw error;
		}

		if (imageUrl !== post.imageUrl) {
			clearImage(post.imageUrl);
		}

		post.title = req.body.title;
		post.content = req.body.content;
		post.imageUrl = imageUrl;

		const result = await post.save();

		console.log(result);

		res.status(200).json({
			message: 'Post updated successfully!',
			post: result
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.deletePost = async (req, res, next) => {
	try {
		const postId = req.params.postId;

		const post = await Post.findById(postId);

		if (!post) {
			const error = new Error('No such post exists!');
			error.statusCode = 404;
			throw error;
		}

		if (post.creator.toString() !== req.userId) {
			const error = new Error('Not Authorized!');
			error.statusCode = 403;
			throw error;
		}

		clearImage(post.imageUrl);

		const result = await Post.findByIdAndRemove(postId);

		console.log(result);

		const user = await User.findById(req.userId);

		user.posts.pull(postId);

		await user.save();

		res.status(200).json({
			message: 'Post deleted successfully!'
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
