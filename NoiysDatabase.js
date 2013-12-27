var NoiysDatabase = function(connection_string) {

		var collections = ["statuses", "votes"],
			mongojs = require('mongojs'),
			db = mongojs.connect(connection_string, collections);

		function findStatus(statusID, callback) {
			try {
				var ObjectId = mongojs.ObjectId,
					query = {
						"_id": ObjectId(String(statusID))
					};

				db.statuses.find(query).toArray(function(err, statuses) {
					if (statuses[0]) {
						status = statuses[0];
						status.id = String(status._id);
					} else {
						status = false;
					}
					callback(status);
				});
			} catch (e) {
				callback(undefined);
			}
		}

		function saveStatus(status, callback) {

			db.statuses.save(status, function(err, saved) {
				if (err || !saved) {
					console.log("Not saved: " + err);
				} else {
					console.log("Saved status to database");
				}

				saved.id = String(saved._id);

				callback(saved);
			});
		}

		function removeOldStatuses(callback) {
			var time_24h_ago = (Math.round(new Date().getTime() / 1000) - (24 * 60 * 60)),
				remove_query = {
					timestamp: {
						$lt: time_24h_ago
					}
				};

			db.statuses.remove(remove_query, function() {
				callback();
			});
		}

		function getStatuses(callback) {
			db.statuses.find({}).toArray(function(err, statuses) {
				for (var i = 0; i < statuses.length; i++) {
					statuses[i].id = String(statuses[i]._id);
				}
				callback(statuses);
			});
		}

		function findStatusesSince(timestamp, callback) {
			db.statuses.find({
				"timestamp": {
					"$gt": parseInt(timestamp)
				}
			}).sort({
				"timestamp": 1
			}).toArray(function(err, statuses) {
				for (var i = 0; i < statuses.length; i++) {
					statuses[i].id = String(statuses[i]._id);
				}
				callback(statuses);
			});
		}

		function findRecentStatuses(num, callback) {
			db.statuses.find({}).sort({
				"timestamp": -1
			}).limit(num).toArray(function(err, statuses) {
				for (var i = 0; i < statuses.length; i++) {
					statuses[i].id = String(statuses[i]._id);
				}
				callback(statuses);
			});
		}


		function saveVote(vote, callback) {

			db.votes.save(vote, function(err, saved) {
				if (err || !saved) {
					console.log("Not saved: " + err);
				} else {
					console.log("Saved vote to database");
				}

				saved.id = String(saved._id);

				callback(saved);
			});
		}

		return {
			findStatus: findStatus,
			saveStatus: saveStatus,
			removeOldStatuses: removeOldStatuses,
			getStatuses: getStatuses,
			findStatusesSince: findStatusesSince,
			findRecentStatuses: findRecentStatuses,
			saveVote: saveVote
		}
	}


module.exports = NoiysDatabase;