var assert = require('assert'),
	NoiysDatabase = require('../NoiysDatabase'),
	connection_string = "mongodb://noiys:41b66c5e0f20416fe935ebf30e9d6c04@linus.mongohq.com:10015/noiys-test",
	connection_string = "mongodb://localhost",
	noiysDatabase = new NoiysDatabase(connection_string);

console.log("testing Mongo");
test("When I save status, I get the saved status back including ID", function(done) {
	var status = {
		text: "same status",
		timestamp: Math.round(new Date().getTime() / 1000),
		votes: 0
	};

	var startTimestamp = new Date().getTime();
	noiysDatabase.saveStatus(status, function(result) {
		console.log("Time to save a status: \t", (new Date().getTime() - startTimestamp) / 1000);
		assert.equal(result.text, status.text);
		assert.equal(result.timestamp, status.timestamp);
		assert.equal(result.votes, status.votes);
		assert(result.id);
		done();
	});
});

test("I can save, then retreive a status", function(done) {

	var status = {
		text: "This is a status",
		timestamp: Math.round(new Date().getTime() / 1000),
		votes: 0
	};

	var startTimestamp = new Date().getTime();
	noiysDatabase.saveStatus(status, function(result) {
		console.log("Time to save a status: \t", (new Date().getTime() - startTimestamp) / 1000);

		startTimestamp = new Date().getTime();
		noiysDatabase.findStatus(result.id, function(foundStatus) {
			console.log("Time to find a status: \t", (new Date().getTime() - startTimestamp) / 1000);
			assert.equal(foundStatus.text, status.text);
			assert.equal(foundStatus.timestamp, status.timestamp);
			assert.equal(foundStatus.votes, status.votes);
			done();
		});
	});

});

test("If I try to get a status which does not exist, false is returned", function(done) {
	startTimestamp = new Date().getTime();
	noiysDatabase.findStatus("000000000000", function(foundStatus) {
		console.log("Time to find a status: \t", (new Date().getTime() - startTimestamp) / 1000);
		assert.equal(foundStatus, false);
		done();
	});
});

test("Old statuses can be removed", function(done) {

	var oldStatus = {
		text: "This is a status",
		timestamp: Math.round(new Date().getTime() / 1000) - (3600 * 25),
		votes: 0
	};

	noiysDatabase.saveStatus(oldStatus, function(result) {
		var oldStatusID = result.id;
		noiysDatabase.removeOldStatuses(function() {
			noiysDatabase.findStatus(oldStatusID, function(foundStatus) {
				assert.equal(foundStatus, false);
				done();
			});

		});
	});
});

test("I can get all statuses back", function(done) {
	var status1 = {
		text: "This is a status",
		timestamp: Math.round(new Date().getTime() / 1000) - (3600 * 25),
		votes: 0
	};
	noiysDatabase.saveStatus(status1, function(result) {
		var status1ID = result.id,
			status2 = {
				text: "This is another status",
				timestamp: Math.round(new Date().getTime() / 1000) - (3600 * 25),
				votes: 0
			};

		noiysDatabase.saveStatus(status2, function(result) {
			var status2ID = result.id;

			noiysDatabase.getStatuses(function(statuses) {

				var foundStatus1 = false,
					foundStatus2 = false;

				for (var i = 0; i < statuses.length; i++) {

					if (statuses[i].id == status1ID) {
						foundStatus1 = true;
					}
					if (statuses[i].id == status2ID) {
						foundStatus2 = true;
					}

				}

				assert.equal(foundStatus1, true);
				assert.equal(foundStatus2, true);

				done();
			});
		});
	});
});

test("I can get all statuses back after a specific timestamp", function(done) {
	var status1 = {
		text: "This is a status that is too old",
		timestamp: Math.round(new Date().getTime() / 1000) - 7200,
		votes: 0
	};
	noiysDatabase.saveStatus(status1, function(result) {
		var status1ID = result.id,
			status2 = {
				text: "This is a new status",
				timestamp: Math.round(new Date().getTime() / 1000),
				votes: 0
			};

		noiysDatabase.saveStatus(status2, function(result) {
			var status2ID = result.id,
				cutoffTimestamp = Math.round(new Date().getTime() / 1000) - 3600;

			noiysDatabase.findStatusesSince(cutoffTimestamp, function(statuses) {

				var foundStatus1 = false,
					foundStatus2 = false;

				for (var i = 0; i < statuses.length; i++) {
					if (statuses[i].id == status1ID) {
						foundStatus1 = true;
					}
					if (statuses[i].id == status2ID) {
						foundStatus2 = true;
					}

				}

				assert.equal(foundStatus1, false);
				assert.equal(foundStatus2, true);

				done();
			});
		});
	});
});

test("I can get the most recent statuses back", function(done) {

	var status1 = {
		text: "This is a status that is too old",
		timestamp: Math.round(new Date().getTime() / 1000) - 7200,
		votes: 0
	},
		status2 = {
			text: "This is a new status to test most recent statuses back",
			timestamp: Math.round(new Date().getTime() / 1000) - 1,
			votes: 0
		},
		latestTimestamp = Math.round(new Date().getTime() / 1000),
		status3 = {
			text: "This is a newer status to test most recent statuses back",
			timestamp: latestTimestamp,
			votes: 0
		},
		expectedNumberOfResponses = 2;

	noiysDatabase.saveStatus(status1, function(result) {
		var status1ID = result.id;
		noiysDatabase.saveStatus(status2, function(result) {
			var status2ID = result.id;
			noiysDatabase.saveStatus(status3, function(result) {
				var status3ID = result.id;

				noiysDatabase.findRecentStatuses(expectedNumberOfResponses, function(statuses) {

					var foundStatus1 = false,
						foundStatus2 = false,
						foundStatus3 = false;

					assert.equal(statuses.length, expectedNumberOfResponses);
					
					for (var i = 0; i < statuses.length; i++) {
						if (statuses[i].id == status1ID) {
							foundStatus1 = true;
						}
						if (statuses[i].id == status2ID) {
							foundStatus2 = true;
						}
						if (statuses[i].id == status3ID) {
							foundStatus3 = true;
						}
					}

					assert.equal(foundStatus3, false);
					assert.equal(statuses[0].timestamp >= latestTimestamp, true);
					done();

				});
			});
		});
	});
});