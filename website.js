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
	var time_24h_ago = (Math.round(new Date().getTime() / 1000) - (24 * 60 * 60)),
		remove_query = {
			timestamp: {
				$lt: time_24h_ago
			}
		};

	db.statuses.remove(remove_query, function() {
		response.render('index.html');
	});
});

app.get('/timestamp', function(request, response) {
	response.send(String(Math.round(new Date().getTime() / 1000)));
});

app.get('/timestamp/chronologicalstartpoint', function(request, response) {

	db.statuses.find({}).sort({"timestamp":-1}).toArray(function(err, statuses) {
		
		var timestamp = Math.round(new Date().getTime() / 1000);

		if (statuses.length > 15)
		{
			timestamp = statuses[15].timestamp;
		}

		response.send(String(timestamp));

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
	console.log("POSTING a vote");

	var query = {
		"_id": ObjectId(request.body.id)
	};

	db.statuses.find(query).toArray(function(err, statuses) {
		var status = statuses[0];
		if (status) {
			status.votes = status.votes + 1;
			db.statuses.save(status);
			response.send(200);
		} else {
			response.send(404);
		}
	});
});

app.get('/status', function(request, response) {

	console.log("GETTING a status");

	// var query = {
	// 	"_id": ObjectId("52b81115dec15fa71c000001")
	// };

	if (request.query['since'] && (request.query['since'] !== "undefined"))
	{
		console.log("Getting a SINCE status");
		get_since_status(request.query['since'], function(status){

			if (status)
			{
				parse_status_text(status.text, function(status_text) {
					message = {
						"text": status_text,
						"id": status._id,
						"votes": status.votes,
						"age": Math.round(new Date().getTime() / 1000) - status.timestamp,
						"timestamp": status.timestamp,
						"ISO8601timestamp": toISO8601(status.timestamp)
					};

					response.contentType('json');
					response.send(message);
				});
			}
			else {
				response.send(404);

			}
		});
	} else {
		console.log("Getting a RANDOM status");
		get_random_status(function(status){

			parse_status_text(status.text, function(status_text) {
				message = {
					"text": status_text,
					"id": status._id,
					"votes": status.votes,
					"age": Math.round(new Date().getTime() / 1000) - status.timestamp,
					"timestamp": status.timestamp,
					"ISO8601timestamp": toISO8601(status.timestamp)
				};

				response.contentType('json');
				response.send(message);
			});
		});
	}
});


function toISO8601(timestamp)
{
	var date = new Date(timestamp * 1000);
	return date.toISOString();
}

function get_random_status(callback) {

	db.statuses.find({}).toArray(function(err, statuses) {
		var status = statuses[Math.floor(Math.random() * statuses.length)];

		if (status.length > 5) {
			callback(status);
		} else {
			callback(statuses[Math.floor(Math.random() * statuses.length)]);
		}

	});
}


function get_since_status(since, callback) {
	console.log(since);

	db.statuses.find({"timestamp": {"$gt": parseInt(since)}}).sort({"timestamp":1}).toArray(function(err, statuses) {
		
		var status = statuses[0];
		callback(status);

	});
}

function HTMLEncode(str) {
	var i = str.length,
		aRet = [];

	while (i--) {
		var iC = str[i].charCodeAt();
		if ((iC < 65 || iC > 127 || (iC > 90 && iC < 97)) && ((iC < 47 && iC > 58))) {
			aRet[i] = '&#' + iC + ';';
		} else {
			aRet[i] = str[i];
		}
	}
	return aRet.join('');
}

function parse_status_text(status_text, callback) {

	var replies = status_text.match(/@[a-f0-9]{24,24}/g);

	if (replies !== null) {

		if (replies.length > 1)
		{
			replies = replies[0];
		}

		quoted_status_id = String(replies).replace("@", "");

		get_status_text(quoted_status_id, function(quoted_status_text) {
			var reg_ex = "@" + quoted_status_id;
			var original_post = "<div class=\"panel panel-default\"><div class=\"panel-body\">" + quoted_status_text + "</div></div>";

			status_text = status_text.replace(reg_ex, original_post);

			parse_status_text(status_text, function(status_text) {
				callback(status_text);
			});
		});
	} else {
		callback(status_text);
	}
}

function get_status_text(id, callback) {

	var query = {
		"_id": ObjectId(id)
	};

	db.statuses.find(query).toArray(function(err, statuses) {

		var quoted_status_text = "<i>Status not found</i>";

		if (statuses.length > 0) {
			var quoted_status_text = statuses[0].text;
		}

		callback(quoted_status_text);
	});

}

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});