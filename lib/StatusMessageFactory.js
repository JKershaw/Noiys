var StatusMessageFactory = function() {
		var statusHtmlParser = require('./StatusHtmlParser');
		var statusTextParser = require('./StatusTextParser');
		var statusHtml2Parser = require('./StatusHtml2Parser');
		var NoiysUi = require('./NoiysUi'),
			noiysUi = new NoiysUi();

		function create(status, callback) {

			statusTextParser(status, function(status_text) {
				statusHtmlParser(status, function(status_html) {
					statusHtml2Parser(status, function(status_html2) {

						var message = {
							"text": status_text,
							"html": status_html,
							"html2": status_html2,
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
				});
			});

		}

		function createRaw(status, callback) {

			var message = {
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