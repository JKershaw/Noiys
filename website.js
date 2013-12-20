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
	console.log("GETTING a status");

	var time_24h_ago = (Math.round(new Date().getTime() / 1000) - (24*60*60)),
		remove_query = {timestamp: {$lt: time_24h_ago}};

	db.statuses.remove(remove_query, function() {
		db.statuses.find().toArray(function(err, statuses) {
			
			var status = get_random_status(statuses);

			message = {
				"text": status.text
			};

			response.contentType('json');
			response.send(message);
		});
	});
});

function get_random_status(statuses){
	var status = statuses[Math.floor(Math.random()*statuses.length)];

	if (status.length > 4){
		return status
	} else {
		var status = statuses[Math.floor(Math.random()*statuses.length)];
	}

}


var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});