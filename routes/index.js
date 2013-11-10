
/*
 * GET home page.
 */

var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var crypto = require('crypto');

function is_authenticated(req, success, failure) {
	var user_id = req.session.user_id;
	var User = mongoose.model( 'User' );
	User.find({_id: new ObjectId(user_id)},function(err, users) {
		if (err || users.length === 0)  {
			failure();
		}
		else {
			success();
		}
	});
}

function find_unique_key(req, res, user) {
	var User = mongoose.model( 'User' );
	var key = crypto.randomBytes(20).toString('hex');
	User.find({key: key},function(err, users) {
		if (users.length === 0) {
			User.update({email: user.email}, {$set: {'key': key}}, function() {
				res.redirect('/');
			});
		}
		else {
			find_unique_key(req, res, user);
		}
	});
}

exports.generate_key = function(req, res){
	var User = mongoose.model( 'User' );
	is_authenticated(req, 
		function() {
			User.find({_id: new ObjectId(req.session.user_id)},function(err, users) {
				find_unique_key(req, res, users[0]);
			});
		},
		function() {
			res.redirect('/');
		});
}

exports.index = function(req, res){
	var User = mongoose.model( 'User' );
	is_authenticated(req, 
		function() {
			User.find({_id: new ObjectId(req.session.user_id)},function(err, users) {
				var user = users[0];
				res.render('home', { 'key': user.key})
			});
		},
		function() {
			User.count({}, function(err, count) {
				res.render('login');
			});
		});
};

exports.logout = function(req, res) {
	req.session.user_id = undefined;
	res.redirect('/');
}


exports.login = function(req, res) {
	var User = mongoose.model( 'User' );
	var email = req.body.email;
	var password = req.body.password;
	User.find({"email": email, "password": password}, function(err, users) {
		if (users.length > 0) {
			req.session.user_id = users[0]._id.toString();
		}
		res.redirect('/');
	});
}

exports.register = function(req, res) {
	var User = mongoose.model( 'User' );
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	if (password === password2 && password.length >= 4 && password.length <= 20) {
		User.find({"email": email}, function(err, users) {
			if (users.length === 0) {
				User.create({ email: email, password: password, key: ""}, function(err, user) {
					req.session.user_id = user._id.toString();
					res.redirect('/');
				});
			}
			else {
				res.redirect('/');
			}
		});
	}
	else {
		res.redirect('/');
	}
	
};
