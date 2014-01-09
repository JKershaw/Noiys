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

		status.score = calculate_score(status);

		noiysDatabase.saveStatus(status, function() {
			process.stdout.write(".");
			finished();
		});
	});
});

function calculate_score(status) {
	return parseInt(status.votes);
}