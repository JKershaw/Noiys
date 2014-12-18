var NoiysDatabase = function(connection_string) {

	var collections = ["statuses", "votes"],
		mongojs = require('mongojs'),
		db = mongojs.connect(connection_string, collections),
		status_cache = {};

	function findStatus(statusID, callback) {
		try {
			var ObjectId = mongojs.ObjectId,
				query = {
					"_id": ObjectId(String(statusID))
				};

			db.statuses.find(query).toArray(function(err, statuses) {
				if (statuses && statuses[0]) {
					status = statuses[0];
					status.id = String(status._id);
					status_cache[statusID] = status;
					if (status.text.length > 5000) {
						status.text = status.text.substr(0, 5000) + " <br /><strong>[...]</strong>";
					}
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
		db.statuses.find({}).limit(1000).toArray(function(err, statuses) {

			console.log(err);
			if (!statuses) {
				statuses = [];
			}

			for (var i = 0; i < statuses.length; i++) {
				statuses[i].id = statuses[i]._id.toString();
				if (statuses[i].text.length > 5000) {
					statuses[i].text = statuses[i].text.substr(0, 5000) + " <br /><strong>[...]</strong>";
				}
			}
			callback(statuses);

		});
	}


	function getStatusesWithProjection(query, projection, callback) {
		db.statuses.find(query, projection).toArray(function(err, statuses) {

			if (!statuses) {
				statuses = [];
			}

			for (var i = 0; i < statuses.length; i++) {
				statuses[i].id = String(statuses[i]._id);
			}

			callback(statuses);
		});
	}

	function getStatusesFromIDs(statusIDs, callback) {

		var ObjectId = mongojs.ObjectId,
			query_array = Array();

		for (var i = 0; i < statusIDs.length; i++) {
			try {
				query_array.push({
					"_id": ObjectId(String(statusIDs[i]))
				});
			} catch (err) {}
		}

		var query = {
			$or: query_array
		};

		db.statuses.find(query).toArray(function(err, statuses) {
			if (!statuses) {
				statuses = [];
			}

			for (var i = 0; i < statuses.length; i++) {
				statuses[i].id = String(statuses[i]._id);
				if (statuses[i].text.length > 5000) {
					statuses[i].text = statuses[i].text.substr(0, 5000) + " <br /><strong>[...]</strong>";
				}
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
			if (!statuses) {
				statuses = [];
			}

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
			if (!statuses) {
				statuses = [];
			}
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

	function findStatusesBefore(timestamp, num, callback) {
		db.statuses.find({
			"timestamp": {
				"$lt": parseInt(timestamp)
			}
		}).sort({
			"timestamp": -1
		}).limit(num).toArray(function(err, statuses) {
			if (!statuses) {
				statuses = [];
			}
			for (var i = 0; i < statuses.length; i++) {
				statuses[i].id = String(statuses[i]._id);
			}
			callback(statuses);
		});
	}

	function findStatusesBySearch(keyword, callback) {
		var regular_expression = new RegExp(".*" + keyword + ".*", "i");

		db.statuses.find({
			"text": regular_expression
		}).sort({
			"timestamp": -1
		}).limit(50).toArray(function(err, statuses) {
			if (!statuses) {
				statuses = [];
			}
			for (var i = 0; i < statuses.length; i++) {
				statuses[i].id = String(statuses[i]._id);
			}
			callback(statuses);
		});
	}

	return {
		saveStatus: saveStatus,
		saveVote: saveVote,
		removeOldStatuses: removeOldStatuses,

		getStatuses: getStatuses,
		getStatusesWithProjection: getStatusesWithProjection,
		getStatusesFromIDs: getStatusesFromIDs,
		findStatus: findStatus,
		findStatusesSince: findStatusesSince,
		findRecentStatuses: findRecentStatuses,
		findStatusesBefore: findStatusesBefore,
		findStatusesBySearch: findStatusesBySearch
	}
}


module.exports = NoiysDatabase;