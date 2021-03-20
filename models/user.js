const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	status: {
		type: String,
		default: 'Hey there! I am on WhatsApp.'
	},
	posts: [{ type: Schema.Types.ObjectId }]
});

module.exports = mongoose.model('User', userSchema);
