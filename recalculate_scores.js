console.log('Recalculating scores now!');

//give every status a score equal to its vote count

var NoiysDatabase = require('./lib/NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._;

noiysDatabase.getStatuses(function(statuses) {

	var finished = _.after(statuses.length, function() {
		process.exit()
	});

	_.each(statuses, function(status) {

		status.score = calculate_score(status);

		noiysDatabase.saveStatus(status, function() {
			process.stdout.write(".");
			finished();
		});
	});
});

function calculate_score(status) {

	var votes = Number(status.votes),
		words = status.text.split(' ').length,
		age = Math.round(new Date().getTime() / 1000) - status.timestamp,
		age_multiplier = age / 86400;

	if (words > 100) {
		words = 100;
	}

	words = 0;

	var age_multiplier = 0.5 + (age_multiplier / 2);

	return (votes + words) * age_multiplier;
}