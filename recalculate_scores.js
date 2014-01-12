console.log('Recalculating scores now!');

//give every status a score equal to its vote count

var NoiysDatabase = require('./lib/NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._;

noiysDatabase.getStatuses(function(statuses) { 

	var finished = _.after(statuses.length, function() {
		process.exit()
	});

	_.each(statuses, function(status){

		if (!status.ancestor && status.ancestors){
			status.ancestor = status.ancestors[0];
		}
		status.score = calculate_score(status);

		noiysDatabase.saveStatus(status, function() {
			process.stdout.write(".");
			finished();
		});
	});
});

function calculate_score(status) {

	var votes = parseInt(status.votes),
		words = status.text.split(' ').length,
		age = Math.round(new Date().getTime() / 1000) - status.timestamp,
		age_multiplier =  1 + (age / 86400);

	return (votes + words) * age_multiplier;
}