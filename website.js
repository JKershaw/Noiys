var express = require("express"),
	app = express();

var NoiysDatabase = require('./OldNoiysDatabase'),
	noiysDatabase = new NoiysDatabase();

app.use(express.logger());

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.bodyParser());

app.get('/', function(request, response) {
	noiysDatabase.removeOldStatuses(function(){
		response.render('index.html');
	});
});

app.get('/timestamp', function(request, response) {
	response.send(String(Math.round(new Date().getTime() / 1000)));
});

app.get('/timestamp/chronologicalstartpoint', function(request, response) {
	var timestamp = Math.round(new Date().getTime() / 1000) - 7200;
	response.send(String(timestamp));
});

app.post('/status', function(request, response) {
	console.log("POSTING a status");

	var status = {
		text: HTMLEncode(request.body.text),
		timestamp: Math.round(new Date().getTime() / 1000),
		votes: 0
	};

	noiysDatabase.saveStatus(status, function(saved){

		var quotes = saved.text.match(/@[a-f0-9]{24,24}/g);

		if (quotes) {
			console.log("there are quotes!");
			process_quotes(saved._id, quotes);
		}

		response.send(200);

	});
});

app.post('/vote', function(request, response) {
	console.log("POSTING a vote");

	noiysDatabase.findStatus(request.body.id, function(status){
		if (status) {
			status.votes = status.votes + 1;
			noiysDatabase.saveStatus(status, function(){});
			response.send(200);
		} else {
			response.send(404);
		}
	});
});

app.get('/status/:ID', function(request, response) {

	console.log("GETTING a status");

	noiysDatabase.findStatus(request.params.ID, function(status){
		parse_status_text(status.text, function(status_text) {
			message = {
				"text": status_text,
				"id": status._id,
				"votes": status.votes,
				"responses": status.responses,
				"age": Math.round(new Date().getTime() / 1000) - status.timestamp,
				"timestamp": status.timestamp,
				"ISO8601timestamp": toISO8601(status.timestamp)
			};

			response.contentType('json');
			response.send(message);
		});
	});
});

app.get('/status', function(request, response) {

	if (request.query['since'] && (request.query['since'] !== "undefined")) {
		console.log("Getting a SINCE status");
		get_since_status(request.query['since'], function(status) {

			if (status) {
				parse_status_text(status.text, function(status_text) {
					message = {
						"text": status_text,
						"id": status._id,
						"votes": status.votes,
						"responses": status.responses,
						"age": Math.round(new Date().getTime() / 1000) - status.timestamp,
						"timestamp": status.timestamp,
						"ISO8601timestamp": toISO8601(status.timestamp)
					};

					response.contentType('json');
					response.send(message);
				});
			} else {
				response.send(404);

			}
		});
	} else {
		console.log("Getting a RANDOM status");
		get_random_status(function(status) {

			parse_status_text(status.text, function(status_text) {
				message = {
					"text": status_text,
					"id": status._id,
					"votes": status.votes,
					"responses": status.responses,
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

function process_quotes(id, quotes) {
	id = String(id).replace("@", "");
	for (var i = 0; i < quotes.length; i++) {
		quotes[i] = quotes[i].replace("@", "");
		add_response_to_status(quotes[i], id);
	}
}

function add_response_to_status(status_id, response_id) {
	console.log("Status:", status_id);
	console.log("Response: ", response_id);

	noiysDatabase.findStatus(status_id, function(status){

		if (!status.responses) {
			status.responses = [];
		}

		status.responses.push(response_id);

		noiysDatabase.saveStatus(status, function(){
			console.log("Saved responses");
		});
	});
}

function toISO8601(timestamp) {
	var date = new Date(timestamp * 1000);
	return date.toISOString();
}

function get_random_status(callback) {

	noiysDatabase.getStatuses(function(statuses) {
		var status = statuses[Math.floor(Math.random() * statuses.length)];

		if (status.length > 5) {
			callback(status);
		} else {
			callback(statuses[Math.floor(Math.random() * statuses.length)]);
		}

	});
}


function get_since_status(since, callback) {
	noiysDatabase.findStatusesSince(since, function(statuses) {
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

		if (replies.length > 1) {
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

	noiysDatabase.findStatus(id, function(status){
		var quoted_status_text = "<i>Status not found</i>";

		if (status) {
			var quoted_status_text = status.text;
		}

		callback(quoted_status_text);
	});

}

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});