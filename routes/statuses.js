var NoiysDatabase = require('../lib/NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._,
	StatusMessageFactory = require('../lib/StatusMessageFactory');

module.exports = function(app) {

	var statusMessageFactory = new StatusMessageFactory();
	var number_of_statuses = 20;

	app.get('/statuses', function(request, response) {

		var statusMessageFactory = new StatusMessageFactory();

		console.log("GETTING recent statuses");


		if (request.query['before'] && (request.query['before'] !== "undefined")) {
			noiysDatabase.findStatusesBefore(request.query['before'], number_of_statuses, function(statuses) {
				handle_returned_statuses(statuses, response, "asc");
			});
		} else {
			noiysDatabase.findRecentStatuses(number_of_statuses, function(statuses) {
				handle_returned_statuses(statuses, response, "desc");
			});
		}
	});
};

function handle_returned_statuses(statuses, response, order) {
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
		statusMessageFactory.create(status, function(message) {
			messages.push(message);
			finished();
		});
	});
}