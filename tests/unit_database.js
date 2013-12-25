var assert = require('assert'),
	NoiysDatabase = require('../NoiysDatabase'),
	connection_string = "mongodb://noiys:41b66c5e0f20416fe935ebf30e9d6c04@linus.mongohq.com:10015/noiys-test",
	noiysDatabase = new NoiysDatabase(connection_string);

test("When I save status, I get the saved status back including ID", function(done) {
	var status = {
		text: "same status",
		timestamp: Math.round(new Date().getTime() / 1000),
		votes: 0
	};

	noiysDatabase.saveStatus(status, function(result) {
		assert.equal(result.text, status.text);
		assert.equal(result.timestamp, status.timestamp);
		assert.equal(result.votes, status.votes);
		assert(result._id);
		done();
	});
});

test("I can save, then retreive a status", function(done) {

	var status = {
		text: "This is a status",
		timestamp: Math.round(new Date().getTime() / 1000),
		votes: 0
	};

	noiysDatabase.saveStatus(status, function(result) {
		noiysDatabase.findStatus(result.id, function(foundStatus) {
			assert.equal(foundStatus.text, status.text);
			assert.equal(foundStatus.timestamp, status.timestamp);
			assert.equal(foundStatus.votes, status.votes);
			done();
		});
	});

});

test("If I try to get a status which does not exist, false is returned", function(done) {
	noiysDatabase.findStatus("000000000000", function(foundStatus) {
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
		var status1ID = result.ID,
			status2 = {
				text: "This is another status",
				timestamp: Math.round(new Date().getTime() / 1000) - (3600 * 25),
				votes: 0
			};

		noiysDatabase.saveStatus(status2, function(result) {
			var status2ID = result.ID;

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