var NoiysDatabase = require('../NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._,
	StatusMessageFactory = require('../lib/StatusMessageFactory');

module.exports = function(app) {

	var statusMessageFactory = new StatusMessageFactory();

	app.get('/search/:search_term', function(request, response) {

		var statusMessageFactory = new StatusMessageFactory();

		console.log("SEARCHING statuses for: ", request.params.search_term);

		noiysDatabase.findStatusesBySearch(request.params.search_term, function(statuses) {

			if (statuses.length > 0) {
				console.log("found! ", statuses.length);
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
			} else {
				response.send(404);
			}

		});

	});
};