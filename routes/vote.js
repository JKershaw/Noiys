var NoiysDatabase = require('../NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING);

module.exports = function(app) {
	app.post('/vote', function(request, response) {
		console.log("POSTING a vote");

		noiysDatabase.findStatus(request.body.id, function(status) {
			if (status) {
				status.votes = status.votes + 1;
				noiysDatabase.saveStatus(status, function() {});
				response.send(200);
			} else {
				response.send(404);
			}
		});
	});
};