var NoiysDatabase = function() {
		var connection_string = "mongodb://noiys:e4bfe4e70b7c76b0299eac37639555fd@paulo.mongohq.com:10035/noiys",
			collections = ["statuses"],
			mongojs = require('mongojs'),
			db = mongojs.connect(connection_string, collections),
			ObjectId = mongojs.ObjectId;

		function findStatus(id, callback) {

			var query = {
				"_id": ObjectId(id)
			};

			db.statuses.find(query).toArray(function(err, statuses) {
				callback(statuses[0]);
			});
		}

		function getStatuses(callback) {
			db.statuses.find({}).sort({
				"timestamp": -1
			}).toArray(function(err, statuses) {
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
				callback(statuses);
			});

		}

		function saveStatus(status, callback) {
			db.statuses.save(status, function(err, saved) {
				if (err || !saved) {
					console.log("Not saved: " + err);
				} else {
					console.log("Saved", saved);
				}

				callback(saved);
			});
		}

		function removeOldStatuses(callback){
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

		return {
			findStatus: findStatus,
			getStatuses: getStatuses,
			findStatusesSince: findStatusesSince,
			saveStatus: saveStatus,
			removeOldStatuses: removeOldStatuses,
			findStatusesSince: findStatusesSince
		}
	}


module.exports = NoiysDatabase;