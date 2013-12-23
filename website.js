var express = require("express"),
	app = express();

var connection_string = "mongodb://noiys:e4bfe4e70b7c76b0299eac37639555fd@paulo.mongohq.com:10035/noiys";

var collections = ["statuses"]
var mongojs = require('mongojs');
var db = mongojs.connect(connection_string, collections);
var ObjectId = mongojs.ObjectId;


app.use(express.logger());

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.bodyParser());

app.get('/', function(request, response) {
	var time_24h_ago = (Math.round(new Date().getTime() / 1000) - (24*60*60)),
		remove_query = {timestamp: {$lt: time_24h_ago}};

	db.statuses.remove(remove_query, function() {
		response.render('index.html');
	});
});

app.post('/status', function(request, response) {
	console.log("POSTING a status");
	db.statuses.save({
		text: HTMLEncode(request.body.text),
		timestamp: Math.round(new Date().getTime() / 1000),
		votes: 0
	}, function(err, saved) {
		if (err || !saved) console.log("Not saved: " + err);
		else console.log("Saved");
		response.send(200);
	});
});

app.post('/vote', function(request, response) {
	console.log("POSTING a vote", request.body.id);

	var query = {"_id": ObjectId(request.body.id)};

	db.statuses.find(query).toArray(function(err, statuses) {
		var status = statuses[0];
		if (status)
		{
			status.votes = status.votes + 1;
			db.statuses.save(status);
			response.send(200);
		}
		else
		{
			response.send(404);
		}
	});
});

app.get('/status', function(request, response) {

	console.log("GETTING a status");
	db.statuses.find({}).sort({"timestamp":-1}).toArray(function(err, statuses) {
		
		var status = get_random_status(statuses);

		message = {
			"text": status.text,
			"id": status._id,
			"votes": status.votes,
			"age": Math.round(new Date().getTime() / 1000) - status.timestamp
		};

		response.contentType('json');
		response.send(message);
	});
});

app.get('/status/:id', function(request, response) {

	console.log("GETTING a specific status");

	var query = {"_id": ObjectId(request.params.id)};

	db.statuses.find(query).toArray(function(err, statuses) {
		
		var status = statuses[0];

		message = {
			"text": status.text,
			"id": status._id,
			"votes": status.votes
		};

		response.contentType('json');
		response.send(message);
	});
});

function get_random_status(statuses){
	var status = statuses[Math.floor(Math.random()*statuses.length)];

	if (status.length > 5){
		return status
	} else {
		return statuses[Math.floor(Math.random()*statuses.length)];
	}

}

function HTMLEncode(str){
  var i = str.length,
      aRet = [];

  while (i--) {
    var iC = str[i].charCodeAt();
    if (iC < 65 || iC > 127 || (iC>90 && iC<97)) {
      aRet[i] = '&#'+iC+';';
    } else {
      aRet[i] = str[i];
    }
   }
  return aRet.join('');    
}

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});