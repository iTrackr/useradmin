var mongoose = require( 'mongoose' );

var userSchema = new mongoose.Schema({
	email: String,
	password: String,
	key: String,
});

mongoose.model("User", userSchema);

mongoose.connect('mongodb://localhost/itrackr');