var StatusMessageFactory = function() {
	var statusParser = require('./StatusParser');

		function create(status, callback) {

			statusParser(status.text, 0, function(status_text) {
				message = {
					"text": status_text,
					"id": status.id,
					"votes": status.votes,
					"responses": status.responses,
					"age": Math.round(new Date().getTime() / 1000) - status.timestamp,
					"timestamp": status.timestamp,
					"ISO8601timestamp": toISO8601(status.timestamp)
				};
				callback(message);
			});
		}

		return {
			create: create
		}
	};

module.exports = StatusMessageFactory;


function toISO8601(timestamp) {
	var date = new Date(timestamp * 1000);
	return date.toISOString();
}

