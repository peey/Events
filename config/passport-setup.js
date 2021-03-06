const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys =require('./keys')
const mysql = require('mysql');
var getConnection = require('../db_pool');
// var con = mysql.createConnection({
// 			host: keys.database.ip,
// 			user: keys.database.user,
// 			password: keys.database.password,
// 			database: keys.database.db
// 		});
// con.connect();
// con.on('error',function(){
// 	console.log('hi error #2')
// });

passport.serializeUser((user,done)=>{
	done(null,user.user_id);
});

passport.deserializeUser((id,done)=>{
	var sql= "SELECT * FROM users WHERE user_id = "+id;
	getConnection(function(err, con){
		if (err) {
			throw err;
		}
		
		//Now do whatever you want with this connection obtained from the pool
		con.query(sql, function (err, result) {
		    if (err) throw err;
		    user=result[0];
			done(null,user);
		});
		con.release();
	});
	
	
});


passport.use(
	new GoogleStrategy({
	//options for the google strategy
	callbackURL: '/auth/google/redirect',
	clientID: keys.google.clientID,
	clientSecret: keys.google.clientSecret

	},
	(accessToken, refreshToken, profile, done)=>{
		//passport callback function
		console.log('passport call back func fired');
		// console.log(profile);
		

		//check if user exists in DB
		var username = profile.displayName;
		var googleID = profile.id;
		// var thumbnail= profile._json.img.url

		var sql1= "SELECT * FROM users WHERE user_id = "+googleID;
		getConnection(function(err, con){
			if (err) {
				throw err;
			}
			//Now do whatever you want with this connection obtained from the pool
			con.query(sql1, function (err, result) {
			    if (err) throw err;
			    // console.log(result);
			    if(result.length!=0){
			    	console.log("************************");
			    	console.log('Welcome user > ' + result[0].username+ ' ('+result[0].club+')');
			    	console.log("************************");
			    	done(null,result[0]);

			    }else{

			  		console.log('************************')
			  		console.log('You are not authorised!!')
			  		console.log('************************')
			        done(null,false);
			    }
			});
			con.release();	
		});
		
	}
));