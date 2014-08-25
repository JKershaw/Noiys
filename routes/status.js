var NoiysDatabase = require('../lib/NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._,
	StatusMessageFactory = require('../lib/StatusMessageFactory'),
	HTMLEncoder = require('../lib/HTMLEncoder');

module.exports = function(app) {

	var statusMessageFactory = new StatusMessageFactory();

	app.post('/status', function(request, response) {

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

				find_ancestor(status, function(ancestor) {
					status.ancestor = ancestor;

					noiysDatabase.saveStatus(status, function(saved) {

						if (quotes) {
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

		noiysDatabase.findStatus(request.params.ID, function(status) {


				console.log("From the DB:", status);

			var requestType = request.get('Content-Type');
			if (requestType && (requestType.indexOf('json') > -1)) {

				if (status) {
					
					response.contentType('json');
					
					if(request.query['reply'] && (request.query['reply'] !== "undefined")) {
						statusMessageFactory.createAsReply(status, function(message) {
							response.send(message);
						});
					} else if(request.query['parent'] && (request.query['parent'] !== "undefined")) {
						statusMessageFactory.createAsParent(status, function(message) {
							response.send(message);
						});
					} else {
						statusMessageFactory.create(status, function(message) {
							response.send(message);
						});
					}
				} else {
					response.send(404);
				}

			} else {

				if (status) {

					statusMessageFactory.create(status, function(message) {
						var model = {
							status: message.text,
							environment: process.env.environment
						};
						response.render('individual-status.ejs', model);
					});
				} else {
					var model = {
						environment: process.env.environment
					};
					response.render('individual-status-404.ejs', model);
				}
			}
		});
	});

	app.get('/status', function(request, response) {

		if (request.query['since'] && (request.query['since'] !== "undefined")) {
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

	noiysDatabase.findStatus(status_id, function(status) {

		if (status){
			if (!status.responses) {
				status.responses = [];
			}

			status.responses.push(response_id);

			noiysDatabase.saveStatus(status, function() {
			});
			
		}
	});
}

function find_ancestor(status, callback) {

	if (status.parent) {

		noiysDatabase.findStatus(status.parent, function(parentStatus) {
			if (parentStatus && parentStatus.ancestor) {
				callback(parentStatus.ancestor);
			} else {
				callback(parentStatus.id);
			}
		});

	} else {
		callback("");
	}
}