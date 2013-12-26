var NoiysDatabase = require('../NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._,
	statusParser = require('../lib/StatusParser'),
	StatusMessageFactory = require('../lib/StatusMessageFactory');

module.exports = function(app) {

	var statusMessageFactory = new StatusMessageFactory();

	app.post('/status', function(request, response) {
		console.log("POSTING a status");

		var status = {
			text: HTMLEncode(request.body.text),
			timestamp: Math.round(new Date().getTime() / 1000),
			votes: 0
		};

		noiysDatabase.saveStatus(status, function(saved) {

			var quotes = saved.text.match(/@[a-f0-9]{24,24}/g);

			if (quotes) {
				console.log("there are quotes!");
				process_quotes(saved.id, quotes);
			}

			response.send(200);

		});
	});

	app.get('/status/:ID', function(request, response) {

		console.log("GETTING a status");

		noiysDatabase.findStatus(request.params.ID, function(status) {
			statusMessageFactory.create(status, function(message){
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
					statusMessageFactory.create(status, function(message){
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
				statusMessageFactory.create(status, function(message){
					response.contentType('json');
					response.send(message);
				});
			});
		}
	});
};

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

	noiysDatabase.findStatus(status_id, function(status) {

		if (!status.responses) {
			status.responses = [];
		}

		status.responses.push(response_id);

		noiysDatabase.saveStatus(status, function() {
			console.log("Saved responses");
		});
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