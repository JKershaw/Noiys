var StatusMessageFactory = function() {
		var StatusParser = require('./StatusParser');

		var NoiysUi = require('./NoiysUi'),
			noiysUi = new NoiysUi();

		var statusParser = new StatusParser();

		function create(status, callback) {
	
			statusParser.parseText(status, function(status_text) {
				statusParser.parseHtml(status, function(status_html) {

					var message = {
						"text": status_text,
						"html": status_html,
						"id": status.id,
						"score": status.score,
						"votes": status.votes,
						"responses": status.responses,
						"age": Math.round(new Date().getTime() / 1000) - status.timestamp,
						"timestamp": status.timestamp,
						"ISO8601timestamp": toISO8601(status.timestamp),
						"ancestor": status.ancestor || "none",
					};
					
					callback(message);
				});
			});

		}

		function createAsReply(status, callback) {

			statusParser.parseHtmlAsReply(status, function(status_replyHtml) {
				var message = {
					"replyHtml": status_replyHtml,
					"id": status.id,
					"score": status.score,
					"votes": status.votes,
					"responses": status.responses,
					"age": Math.round(new Date().getTime() / 1000) - status.timestamp,
					"timestamp": status.timestamp,
					"ISO8601timestamp": toISO8601(status.timestamp),
					"ancestor": status.ancestor,
				};
				
				callback(message);
			});

		}

		function createAsParent(status, callback) {

			statusParser.parseHtmlAsParent(status, function(status_parentHtml) {
				var message = {
					"parentHtml": status_parentHtml,
					"id": status.id,
					"score": status.score,
					"votes": status.votes,
					"responses": status.responses,
					"age": Math.round(new Date().getTime() / 1000) - status.timestamp,
					"timestamp": status.timestamp,
					"ISO8601timestamp": toISO8601(status.timestamp),
					"ancestor": status.ancestor,
				};
				
				callback(message);
			});

		}

		function createRaw(status, callback) {

			var message = {
				"text": status.text,
				"id": status.id,
				"votes": status.votes,
				"score": status.score,
				"responses": status.responses,
				"age": Math.round(new Date().getTime() / 1000) - status.timestamp,
				"timestamp": status.timestamp,
				"ISO8601timestamp": toISO8601(status.timestamp),
				"ancestor": status.ancestor,
			};
			callback(message);

		}

		return {
			create: create,
			createRaw: createRaw,
			createAsReply: createAsReply,
			createAsParent: createAsParent
		}
	};

module.exports = StatusMessageFactory;


function toISO8601(timestamp) {
	var date = new Date(timestamp * 1000);
	return date.toISOString();
}