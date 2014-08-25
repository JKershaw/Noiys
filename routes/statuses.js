var NoiysDatabase = require('../lib/NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._,
	StatusMessageFactory = require('../lib/StatusMessageFactory');

module.exports = function(app) {

	var initial_number_of_statuses = 15,
		number_of_statuses = 20;

	app.get('/statuses', function(request, response) {

		response.setHeader('Content-Type', 'application/json');

		if (request.query['before'] && (request.query['before'] !== "undefined")) {
			noiysDatabase.findStatusesBefore(request.query['before'], number_of_statuses, function(statuses) {
				handle_returned_statuses(statuses, response, (request.query['raw'] == "true"));
			});
		} else if(request.query['IDs'] && (request.query['IDs'] !== "undefined")) {
			noiysDatabase.getStatusesFromIDs(request.query['IDs'].split(","), function(statuses) {
				handle_returned_statuses(statuses, response, (request.query['raw'] == "true"));
			});
		} else if(request.query['home'] == "true") {
			handle_home_statuses(request, response, (request.query['raw'] == "true"));
		} else {
			noiysDatabase.findRecentStatuses(initial_number_of_statuses, function(statuses) {
				handle_returned_statuses(statuses, response, (request.query['raw'] == "true"));
			});
		}
	});
};

function handle_home_statuses(request, response, raw) {

	noiysDatabase.getStatuses(function(statuses) {

		// sort by score
		statuses.sort(function compare(a, b) {
			if (a.score > b.score) return -1;
			if (a.score < b.score) return 1;
			return 0;
		});

		// leave only the highest scored status from any given conversation
		var seen_conversation_ids = [];
		var tmp_statuses = [];

		// strip out duplicates
		for(var i=0;i<statuses.length;i++) {
			
			var current_status_ancestor = statuses[i].ancestor;

			if ((statuses[i].ancestor == "")  || (statuses[i].ancestor == undefined)) {
				current_status_ancestor = statuses[i].id;
			}
			
			if (seen_conversation_ids.indexOf(current_status_ancestor) == -1) {
				seen_conversation_ids.push(current_status_ancestor);
				tmp_statuses.push(statuses[i]);
			}
		}

		statuses = tmp_statuses;

		// get the top 20 remaining posts
		statuses = statuses.slice(0, 20);

		handle_returned_statuses(statuses, response, raw);

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