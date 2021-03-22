const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const compression = require('compression');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(null, new Date().toISOString() + file.originalname);
	}
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpeg' ||
		file.mimetype === 'image/jpg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.use(express.json());
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Headers', '*');
	res.set('Access-Control-Allow-Methods', '*');
	if (req.method === 'OPTIONS') {
		res.status(200).end();
		return;
	}
	next();
});

app.use(compression());

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;

	res.status(status).json({
		message,
		data
	});
});

const connectToDB = async () => {
	try {
		await mongoose.connect(
			`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@c0.dvnbp.mongodb.net/udemy?retryWrites=true&w=majority`,
			{
				useUnifiedTopology: true,
				useCreateIndex: true,
				useNewUrlParser: true
			}
		);

		app.listen(process.env.PORT || 8080);
	} catch (err) {
		console.log(err);
	}
};

connectToDB();
