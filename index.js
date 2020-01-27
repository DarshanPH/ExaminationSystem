const express = require('express'), /* express import */
app = express(),
port = 3000;
bodyParser = require('body-parser');
var session = require('express-session');



/*************************************DATABASE CONNECTION START FROM HERE *****************************/
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'dp123',
  database: 'exam'
});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

connection.connect();

/******************************************DATABASE CONNECTION COMPLTED HERE *************************/


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("bootstrap"));


app.set("view engine","ejs");






/**************************** LOGIN OPERATION START FROM HERE *********************************/


app.get("/", function(req,res){
	res.render("login");
});

app.post('/login', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	var usn = request.body.usn;
	if (username && password && usn) {
		connection.query('SELECT * FROM users WHERE username = ? AND password = ? AND usn = ?', [username, password,usn], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				request.session.usn = usn;
				response.redirect("home");
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
	//	response.send('Welcome back, ' + request.session.username + '!');
       response.render("home");	
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

/***********************************************LOGIN OPERATION END HERE ***************************/





/************************************************SIGNUP OPERATION START FROM HERE*****************************/


app.get("/signup",function(req,res){
	res.render("registration")
});

app.post("/signup",function(req,res){
	var id = req.body.usn;
	var fname = req.body.fname;
	var mname = req.body.mname;
	var lname = req.body.lname;
	var username = req.body.username;
	var password = req.body.password;
	var mblno = req.body.mblno;
	var email = req.body.email;
	var sql = "INSERT INTO users(usn, fname, mname, lname, username, password, mblno,email)	VALUES('"+id+"', '"+fname+"', '"+mname+"', '"+lname+"', '"+username+"', '"+password+"', '"+mblno+"', '"+email+"')";
	connection.query(sql, function(err, results){
		if(err){
			console.log("Error!", err)
		}else {
			res.redirect("/");
		}
	});

});




/***************************************************Signup OPERATION END HERE******************************/

/***************************************************Update Password*****************************************/
app.get("/update",function(req, res){
	res.render("update");
});

app.post("/update", function(req,res){
	var username = req.body.username
	var newpassword = req.body.new
	var oldpassword = req.body.old
	connection.query('select * from users where username=? and password=?', [username,oldpassword],function(error,results,field){
		if(results.length==1){
		connection.query('update users set password = ? where username=? and password=?',[newpassword,username,oldpassword],function(error,results,field){
		res.redirect("/");
			//console.log(username,newpassword,oldpassword)
		})
		}else{
			res.send("user name and password is not found");
		}
	})

})

/*****************************************************Update End here***************************************/



/********************************************LOGOUT OPERATION**********************************************/
app.get("/logout",function(req,res){
	req.session.loggedin = false;
	req.session.username = null;
	res.render("login");
});


/************************************************LOGOUT COMPLTED*********************************************/








/*************************************************Question Answer Opration Start here************************/
// app.get("/exam",function(req,res,field){
// 	res.render("question")
// });

app.get("/exam/:id", function(req,res){
	if (req.session.loggedin) { 
	var usn =  req.session.usn;
	connection.query('select qid from answer where usn = ?',[usn],function(error,results,field){
		console.log(results)
		if(results.length==20){
			res.send("sorry You already takened a exam");
		}else{
	
connection.query('SELECT * FROM question WHERE qid = ?',[req.params.id], function(err, results, fields){
	if(err){
		console.log(err)
	}else{
		//res.send(results);
		res.render("question", {results:results});
	}
	});
}
});
} else {
	res.render("error");
}
});


app.post("/exam/:id",function(req, res){
	var usn = req.session.usn;
	var id = req.body.id;
	var Ans = req.body.Ans;
	let qid = req.body.qid;
	var actualans = req.body.answer;
	console.log(actualans);
	let newid = ++qid;
	if(Ans==actualans){
		Ans=1;
	} else {
		Ans=0;
	}
	//console.log(newid);
	var sql = "INSERT INTO answer(usn,qid,correct) VALUES('"+usn+"','"+id+"','"+Ans+"')";
	connection.query(sql,function(err, results){
		if(err){
			console.log("Error-!",err)
		}else{
			res.redirect("/exam/"+newid);
		}
	});
});



// app.post("/exam",function(req, res){
// 	var ans = req.body.Ans;
// 	var sql = "INSERT INTO answer(answer) VALUES('"+ans+"')";
// 	connection.query(sql,function(err, result){
// 		if(err){
// 			console.log("Error-!",err)
// 		}else{
// 			result.render("result");
// 		}
// 	})
// })



/********************************************* question answer operation complete here***************************************/








/*********************************************Admin Table started Here*******************************************************/

app.get("/handle", function(req,res){
	res.render("handle");
});

app.post('/handle', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect("load");
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


app.post("/admin", function(req, res){
	var qid   = req.body.qid;
	var qname = req.body.qname;
	var answer1 = req.body.answer1;
	var answer2 = req.body.answer2;
	var answer3 = req.body.answer3;
	var answer4 = req.body.answer4;
	var correct = req.body.correct;
	var sql = "INSERT INTO question (qid,qname,answer1,answer2,answer3,answer4,answer) VALUES ('"+qid+"','"+qname+"', '"+answer1+"', '"+answer2+"', '"+answer3+"', '"+answer4+"', '"+correct+"')";
	connection.query(sql, function(err, results){
		if(err){
			console.log("Error-!",err);
		}else{
			res.redirect("admin");
		}
	});
});


app.get("/load", function(req,res){
	res.render("adminhandle")
});


app.get("/show", function(req,res){
connection.query('SELECT * FROM question', function(err, results, fields){
	if(err){
		console.log(err)
	}else{
		res.render("showquestion", {results:results});
	}
	});
});


app.get("/count",function(req, res){
	connection.query('select distinct (select count(usn) from users) as usn,(select count(qid) from question) as qid from question,users;',function(err,results,field){
		if(err){
			console.log(err)
		}else{
			res.render("count",{results:results})
		}
	});
});

app.get("/usn",function(req, res){
	connection.query('SELECT COUNT(usn) as usn FROM users',function(err,results,field){
		if(err){
			console.log(err)
		}else{
			res.render("usn",{results:results})
		}
	});
});





app.get("/delete", function(req,res){
connection.query('SELECT * FROM question', function(err, results, fields){
	if(err){
		console.log(err)
	}else{
		res.render("delete", {results:results});
	}
	});
});



app.get("/delete/:id", function(req, res){
	var qid = req.params.id;
	//console.log(qid);

	connection.query('DELETE FROM question WHERE qid = ?',[qid], function(err, results){
		if(err){
			console.log(err)
		}else{
			res.redirect("/delete")
		}
 	});
});




app.get("/admin", function(req,res){
	if(req.session.loggedin){
connection.query('SELECT * FROM question', function(err, results, fields){
	if(err){
		console.log(err)
	}else{
		res.render("admin", {results:results});
	}
	});
} else {
	res.render("Aerror");
}
});


app.get("/admin/student", function(req, res){
	var usn = req.body.usn;
	var sql1 = 'select * from result';
	connection.query(sql1, function(err,results,fields){
		if(err){
			throw err;
		}else{
			res.render("student",{results:results});
		}
	});
});



// app.get("/admin/score", function(req, res){
// 	var email=req.body.email;
// 	console.log(email);
// connection.query('select sum(a.correct) as sum,u.fname as fname,u.lname as lname,u.email as email,u.mblno as mblno from answer as a, users as u where a.usn = u.usn and where email=?',[email],function(err,results,fields){
// if(err){
// 	throw err;
// }else{
// 	res.render("score",{results:results})
// }
// });
// });



/**********************************************************Admin Table end Here************************************/


//*********************************************************Result Table Start Here*********************************/


app.get("/result", function(req,res){
	var username = req.session.username;
		if (req.session.loggedin) {  
connection.query('select u.usn,u.fname,u.lname,u.email,u.mblno,sum(a.correct) as sum from users as u,answer as a where u.usn=a.usn and username= ?', [username], function(err, results, fields){
	if(err){
		console.log(err)
	}else{	
		console.log(results);
		res.render("result", {result:results});
	}
	});
} else {
	res.render("error");
}
 });

//***************************************************Result table end here**************************************************//


app.listen(port, () => console.log(`Example app listening on port ${port}!`),function(){
	console.log("Server is now started-!");
});

