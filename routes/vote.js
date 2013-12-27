var NoiysDatabase = require('../NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	crypto = require('crypto');

module.exports = function(app) {
	app.post('/vote', function(request, response) {

		console.log("POSTING a vote");

		noiysDatabase.findStatus(request.body.id, function(status) {
			if (status) {
				status.votes = status.votes + 1;
				noiysDatabase.saveStatus(status, function() {

					var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress;
					var shasum = crypto.createHash('sha1').update(ip);
					var ipHash = shasum.digest('hex');

					var vote = {
						user_id: ipHash,
						status_id: status.id,
						timestamp: Math.round(new Date().getTime() / 1000)
					};

					noiysDatabase.saveVote(vote, function(result) {
						response.send(200);
					});
				});
			} else {
				response.send(404);
			}
		});
	});
};