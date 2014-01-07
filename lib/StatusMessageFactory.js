var StatusMessageFactory = function() {
	var statusHtmlParser = require('./StatusHtmlParser');

		function create(status, callback) {

			statusHtmlParser(status.text, function(status_text, status_html) {
				message = {
					"text": status_text,
					"html": status_html,
					"id": status.id,
					"votes": status.votes,
					"responses": status.responses,
					"age": Math.round(new Date().getTime() / 1000) - status.timestamp,
					"timestamp": status.timestamp,
					"ISO8601timestamp": toISO8601(status.timestamp),
					"ancestors": status.ancestors,
				};
				callback(message);
			});

		}

		function createRaw(status, callback) {

			message = {
				"text": status.text,
				"id": status.id,
				"votes": status.votes,
				"responses": status.responses,
				"age": Math.round(new Date().getTime() / 1000) - status.timestamp,
				"timestamp": status.timestamp,
				"ISO8601timestamp": toISO8601(status.timestamp),
				"ancestors": status.ancestors,
			};
			callback(message);
			
		}

		return {
			create: create,
			createRaw: createRaw
		}
	};

module.exports = StatusMessageFactory;


function toISO8601(timestamp) {
	var date = new Date(timestamp * 1000);
	return date.toISOString();
}

