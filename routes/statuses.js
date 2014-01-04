var NoiysDatabase = require('../lib/NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._,
	StatusMessageFactory = require('../lib/StatusMessageFactory'),
	NoiysFeed = require('../lib/NoiysFeed'),
	noiysFeed = new NoiysFeed();

module.exports = function(app) {

	var number_of_statuses = 20;

	app.get('/statuses', function(request, response) {

		console.log("GETTING statuses =>", request.query);

		if (request.query['before'] && (request.query['before'] !== "undefined")) {
			noiysDatabase.findStatusesBefore(request.query['before'], number_of_statuses, function(statuses) {
				handle_returned_statuses(statuses, response, (request.query['raw'] == "true"));
			});
		} else if(request.query['IDs'] && (request.query['IDs'] !== "undefined")) {
			noiysDatabase.getStatusesFromIDs(request.query['IDs'].split(","), function(statuses) {
				handle_returned_statuses(statuses, response, (request.query['raw'] == "true"));
			});
		} else if(request.query['home'] == "true") {
			handle_home_statuses(request, response);
		} else {
			noiysDatabase.findRecentStatuses(number_of_statuses, function(statuses) {
				handle_returned_statuses(statuses, response, (request.query['raw'] == "true"));
			});
		}
	});

	app.get('/statuses/feed', function(request, response) {
		console.log("GETTING FEED");

		noiysFeed.getStatuses(function(statuses) {
			handle_returned_statuses(statuses, response);
		});
		
	});
};

function handle_home_statuses(request, response) {

	noiysDatabase.getStatuses(function(statuses) {

		statuses.sort(function compare(a, b) {
			if (a.votes > b.votes) return -1;
			if (a.votes < b.votes) return 1;
			return 0;
		});

		statuses = statuses.slice(0, 30);

		var messages = new Array(),
			statusMessageFactory = new StatusMessageFactory();

		var finished = _.after(statuses.length, function() {

			messages.sort(function compare(a, b) {
				if (a.votes > b.votes) return -1;
				if (a.votes < b.votes) return 1;
				return 0;
			});

			response.contentType('json');
			response.send(messages);
		});

		_.each(statuses, function(status) {
			statusMessageFactory.create(status, function(message) {
				messages.push(message);
				finished();
			});
		});
	});
}

function handle_returned_statuses(statuses, response, raw) {
	
	if(!statuses || statuses.length ==0){
		response.send(404);
	}

	var messages = new Array(),
		statusMessageFactory = new StatusMessageFactory();

	var finished = _.after(statuses.length, function() {

		messages.sort(function compare(a, b) {
			if (a.timestamp < b.timestamp) return -1;
			if (a.timestamp > b.timestamp) return 1;
			return 0;
		});

		response.contentType('json');
		response.send(messages);
	});

	_.each(statuses, function(status) {
		if (raw) {
			statusMessageFactory.createRaw(status, function(message) {
				messages.push(message);
				finished();
			});
		} else {
			statusMessageFactory.create(status, function(message) {
				messages.push(message);
				finished();
			});
		}
	});
	
}