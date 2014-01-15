var assert = require('assert'),
	NoiysDatabase = require('../../lib/NoiysDatabase'),
	connection_string = "mongodb://noiys:5ea6d0c8a0684fc6cba80e2691b7b90d@linus.mongohq.com:10015/noiys-test",
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


test("When I save a vote, I get the saved vote back including ID", function(done) {
	var vote = {
		user_id: "5678",
		status_id: "12345678",
		timestamp: Math.round(new Date().getTime() / 1000)
	};

	noiysDatabase.saveVote(vote, function(result) {
		console.log("Saved vote to database");
		assert.equal(result.user_id, vote.user_id);
		assert.equal(result.timestamp, vote.timestamp);
		assert.equal(result.status_id, vote.status_id);
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
		latestTimestamp = Math.round(new Date().getTime() / 1000)-1,
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

					assert.equal(statuses.length, expectedNumberOfResponses);

					for (var i = 0; i < statuses.length; i++) {
						assert.equal(statuses[i].timestamp >= latestTimestamp, true);
					}
					done();

				});
			});
		});
	});
});


test("I can get the most recent statuses back", function(done) {

	var status1 = {
		text: "I want this status back",
		timestamp: Math.round(new Date().getTime() / 1000) - 7200
	},
		status2 = {
			text: "I want this status back also",
			timestamp: Math.round(new Date().getTime() / 1000) - 7230
		},
		status3 = {
			text: "I don't want this one back",
			timestamp: Math.round(new Date().getTime() / 1000) - 1
		},
		latestTimestamp = Math.round(new Date().getTime() / 1000),
		status4 = {
			text: "Or this one",
			timestamp: latestTimestamp
		},
		expectedNumberOfResponses = 2;

	noiysDatabase.saveStatus(status1, function(result) {
		var status1ID = result.id;
		noiysDatabase.saveStatus(status2, function(result) {
			var status2ID = result.id;
			noiysDatabase.saveStatus(status3, function(result) {
				var status3ID = result.id;
				noiysDatabase.saveStatus(status4, function(result) {
					var status4ID = result.id;

					var cutoffTimestamp = Math.round(new Date().getTime() / 1000) - 3600;
					noiysDatabase.findStatusesBefore(cutoffTimestamp, expectedNumberOfResponses, function(statuses) {

						var foundStatus1 = false,
							foundStatus2 = false,
							foundStatus3 = false,
							foundStatus4 = false;

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
							if (statuses[i].id == status4ID) {
								foundStatus4 = true;
							}
						}
						assert.equal(foundStatus3, false);
						assert.equal(foundStatus4, false);
						assert.equal(statuses[0].timestamp <= cutoffTimestamp, true);
						assert.equal(statuses[1].timestamp <= statuses[0].timestamp, true);
						done();

					});
				});
			});
		});
	});
});


test("I can search for statuses by keyword", function(done) {
	var status1 = {
		text: "Zebra alphabet!",
		timestamp: Math.round(new Date().getTime() / 1000) - (3600 * 25)
	};
	noiysDatabase.saveStatus(status1, function(result) {
		var status1ID = result.id;

		noiysDatabase.findStatusesBySearch("zebra", function(statuses) {

			var foundStatus1 = false;

			for (var i = 0; i < statuses.length; i++) {

				if (statuses[i].id == status1ID) {
					foundStatus1 = true;
				}

			}

			assert.equal(foundStatus1, true);

			done();
		});
	});
});

test("I can get several statuses back", function(done) {

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
		latestTimestamp = Math.round(new Date().getTime() / 1000)-1,
		status3 = {
			text: "This is a newer status to test most recent statuses back",
			timestamp: latestTimestamp,
			votes: 0
		},
		expectedNumberOfResponses = 3;

	noiysDatabase.saveStatus(status1, function(result) {
		var status1ID = result.id;
		noiysDatabase.saveStatus(status2, function(result) {
			var status2ID = result.id;
			noiysDatabase.saveStatus(status3, function(result) {
				var status3ID = result.id;

				var status_array = [status1ID, status2ID, status3ID];
				
				noiysDatabase.getStatusesFromIDs(status_array, function(statuses) {

					assert.equal(statuses.length, expectedNumberOfResponses);

					var foundStatus1 = false,
						foundStatus2 = false,
						foundStatus3 = false;

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

					assert.equal(foundStatus1, true);
					assert.equal(foundStatus2, true);
					assert.equal(foundStatus3, true);

					done();

				});
			});
		});
	});
});