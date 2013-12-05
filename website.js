var express = require("express"),
	app = express();

var connection_string = "mongodb://noiys:e4bfe4e70b7c76b0299eac37639555fd@paulo.mongohq.com:10035/noiys";

var collections = ["statuses"]
var db = require("mongojs").connect(connection_string, collections);


app.use(express.logger());

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.bodyParser());

app.get('/', function(request, response) {
	response.render('index.html');
});

app.post('/status', function(request, response) {
	console.log("POSTING a status");
	db.statuses.save({
		text: request.body.text,
		timestamp: Math.round(new Date().getTime() / 1000)
	}, function(err, saved) {
		if (err || !saved) console.log("Not saved: " + err);
		else console.log("Saved");
		response.send(200);
	});

});

app.get('/status', function(request, response) {
	// send the response
	message = {
		"text": "This is a sample status. Woo stuff!"
	};

	response.contentType('json');
	response.send(message);


});


var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});