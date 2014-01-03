var NoiysDatabase = require('../lib/NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING);

var NoiysFeed = function() {

		function getStatuses(callback) {
			noiysDatabase.getStatuses(function(statuses) {
				statuses = statuses.slice(0, 20);
				callback(statuses);
			});
		}

		return {
			getStatuses: getStatuses
		}
	}


module.exports = NoiysFeed;