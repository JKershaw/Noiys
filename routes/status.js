var NoiysDatabase = require('../lib/NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._,
	StatusMessageFactory = require('../lib/StatusMessageFactory'),
	HTMLEncoder = require('../lib/HTMLEncoder');

module.exports = function(app) {

	var statusMessageFactory = new StatusMessageFactory();

	app.post('/status', function(request, response) {
		console.log("POSTING a status: ");

		HTMLEncoder().encode(request.body.text, function(encodedText) {

			encodedText = encodedText.trim();
			if (encodedText && (encodedText != "") && (encodedText.length > 0)) {

				var status = {
					text: encodedText,
					timestamp: Math.round(new Date().getTime() / 1000),
					votes: 0,
					score: 0
				};

				var quotes = encodedText.match(/@[a-f0-9]{24,24}/g);

				if (quotes) {
					status.parent = quotes[0].replace("@", "");
				}


				find_ancestors(status, function(ancestors) {
					status.ancestors = ancestors;

					noiysDatabase.saveStatus(status, function(saved) {

						if (quotes) {
							console.log("there are quotes!");
							process_quotes(saved.id, quotes);
						}

						response.send(String(saved.id));

					});
				});
			} else {
				response.send(400);
			}
		});
	});

	app.get('/status/:ID', function(request, response) {

		console.log("GETTING a specific status: ", request.params.ID);


		noiysDatabase.findStatus(request.params.ID, function(status) {

			var requestType = request.get('Content-Type');
			if (requestType && (requestType.indexOf('json') > -1)) {

				if (status) {
					statusMessageFactory.create(status, function(message) {
						response.contentType('json');
						response.send(message);
					});
				} else {
					response.send(404);
				}

			} else {

				if (status) {

					statusMessageFactory.create(status, function(message) {
						var model = {
							text: message.text
						};
						response.render('individual-status.ejs', model);
					});
				} else {
					response.render('individual-status-404.ejs');
				}
			}

		});


	});

	app.get('/status', function(request, response) {

		if (request.query['since'] && (request.query['since'] !== "undefined")) {
			console.log("Getting a SINCE status");
			get_since_status(request.query['since'], function(status) {

				if (status) {
					statusMessageFactory.create(status, function(message) {
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
				if (status) {
					statusMessageFactory.create(status, function(message) {
						response.contentType('json');
						response.send(message);
					});
				} else {
					response.send(404);
				}
			});
		}
	});
};

function get_random_status(callback) {

	noiysDatabase.getStatuses(function(statuses) {

		if (statuses.length > 0) {
			var status = statuses[Math.floor(Math.random() * statuses.length)];

			if (status.length > 5) {
				callback(status);
			} else {
				callback(statuses[Math.floor(Math.random() * statuses.length)]);
			}
		} else {
			callback();
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

		if (status){
			if (!status.responses) {
				status.responses = [];
			}

			status.responses.push(response_id);

			noiysDatabase.saveStatus(status, function() {
				console.log("Saved responses");
			});
			
		}
	});
}

function find_ancestors(status, callback) {

	var quotes = status.text.match(/@[a-f0-9]{24,24}/g);
	var ancestors = Array();

	if (quotes) {

		var finished = _.after(quotes.length, function() {
			callback(ancestors);
		});

		_.each(quotes, function(quote) {

			noiysDatabase.findStatus(quote, function(status) {
				if (status && status.ancestors) {
					ancestors.push(status.ancestors);
				} else {
					ancestors.push(quote.replace("@", ""));
				}
				finished();
			});
		});

	} else {
		callback(ancestors);
	}
}