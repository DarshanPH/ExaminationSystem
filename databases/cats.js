var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/db");

var carSchema = new mangoo.Scheema({
	name: String,
	age: Number,
	Address: String
});

var Cat = mongoose.model("Cat", CatSchema);

var george = new Cat({
	name: "DP",
	age: 11,

});

george.save(function(err,cat){
	if(err){
		console.log("something wnet wrong");

	}else {
		console.log("added to the database");
		console.log(cat);
	}
});