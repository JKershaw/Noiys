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
		} else if (request.query['IDs'] && (request.query['IDs'] !== "undefined")) {
			noiysDatabase.getStatusesFromIDs(request.query['IDs'].split(","), function(statuses) {
				handle_returned_statuses(statuses, response, (request.query['raw'] == "true"));
			});
		} else if (request.query['home'] == "true") {
			handle_home_statuses(request, response, (request.query['raw'] == "true"));
		} else {
			noiysDatabase.findRecentStatuses(initial_number_of_statuses, function(statuses) {
				handle_returned_statuses(statuses, response, (request.query['raw'] == "true"));
			});
		}
	});


	function handle_home_statuses(request, response, raw) {

		var projection = {
			score: 1,
			ancestor: 1
		};

		noiysDatabase.getStatusesWithProjection({}, projection, function(statuses) {

			// sort by score
			statuses.sort(function compare(a, b) {
				return b.score - a.score;
			});

			// leave only the highest scored status from any given conversation
			var seen_conversation_ids = [];
			var tmp_statuses = [];

			// strip out duplicates
			for (var i = 0; i < statuses.length; i++) {

				var current_status_ancestor = statuses[i].ancestor;

				if ((statuses[i].ancestor == "") || (statuses[i].ancestor == undefined)) {
					current_status_ancestor = statuses[i].id;
				}

				if (seen_conversation_ids.indexOf(current_status_ancestor) === -1) {
					seen_conversation_ids.push(current_status_ancestor);
					tmp_statuses.push(statuses[i]);
				}
			}

			// get the top 100 remaining posts
			tmp_statuses = tmp_statuses.slice(0, 100);

			// we have the Ids, now to get the actual statuses

			var id_array = [];
			for (var i = 0; i < tmp_statuses.length; i++) {
				id_array.push(tmp_statuses[i].id);
			}

			noiysDatabase.getStatusesFromIDs(id_array, function(statuses) {
				statuses.sort(function compare(a, b) {
					return b.score - a.score;
				});
				handle_returned_statuses(statuses, response, raw);
			});


		});
	}

};


function handle_returned_statuses(statuses, response, raw) {

	if (!statuses || statuses.length == 0) {
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
