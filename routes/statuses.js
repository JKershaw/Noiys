var NoiysDatabase = require('../NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._,
	StatusMessageFactory = require('../lib/StatusMessageFactory');

module.exports = function(app) {

	var statusMessageFactory = new StatusMessageFactory();

	app.get('/statuses', function(request, response) {

		var statusMessageFactory = new StatusMessageFactory();

		console.log("GETTING recent statuses");


		if (request.query['before'] && (request.query['before'] !== "undefined")) {

			noiysDatabase.findStatusesBefore(request.query['before'], 20, function(statuses) {

				var messages = new Array();

				var finished = _.after(statuses.length, function() {

					messages.sort(function compare(a, b) {
						if (a.timestamp > b.timestamp) return -1;
						if (a.timestamp < b.timestamp) return 1;
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
		} else {
			noiysDatabase.findRecentStatuses(20, function(statuses) {

				var messages = new Array();

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
			});
		}
	});
};