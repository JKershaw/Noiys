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
	// 	"_id": ObjectId("52b80dc4ebc9700200000001")
	// };

	query = {};
	db.statuses.find(query).sort({
		"timestamp": -1
	}).toArray(function(err, statuses) {

		var status = get_random_status(statuses);

		parse_status_text(status.text, function(status_text) {
			message = {
				"text": status_text,
				"id": status._id,
				"votes": status.votes,
				"age": Math.round(new Date().getTime() / 1000) - status.timestamp
			};

			response.contentType('json');
			response.send(message);
		});


	});
});


function get_random_status(statuses) {
	var status = statuses[Math.floor(Math.random() * statuses.length)];

	if (status.length > 5) {
		return status
	} else {
		return statuses[Math.floor(Math.random() * statuses.length)];
	}

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

	console.log("=====================");
	console.log(status_text);
	console.log("=====================");

	var replies = status_text.match(/@[a-f0-9]{24,24}/g);

	if (replies !== null) {
		console.log("Found quote!");

		quoted_status_id = String(replies).replace("@", "");

		get_status_text(quoted_status_id, function(quoted_status_text) {
			var reg_ex = "@" + quoted_status_id;
			var original_post = "<div class=\"panel panel-default\"><div class=\"panel-body\">" + quoted_status_text + "</div></div>";

			status_text = status_text.replace(reg_ex, original_post);

			console.log("callbacking: ", status_text);

			parse_status_text(status_text, function(status_text) {
				callback(status_text);
			});
		});
	} else {
		console.log("No quotes found");
		callback(status_text);
	}
}

function get_status_text(id, callback) {

	console.log("Fetching ", id);

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