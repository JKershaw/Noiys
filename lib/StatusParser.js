var NoiysDatabase = require('../NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._

var StatusParser = function(status_text, callback) {
	
	var quotes = status_text.match(/@[a-f0-9]{24,24}/g);

	if (quotes !== null) {

		var finished = _.after(quotes.length, function() {
				callback(status_text);
			});

		_.each(quotes, function(quote) {

			quoted_status_id = String(quote).replace("@", "");

			get_status_text(quoted_status_id, function(found_quoted_status_text, original_id) {

				var reg_ex = "@" + original_id;
				var embedded_quote = "<div class=\"panel panel-default\"><div class=\"panel-body\">" + found_quoted_status_text + "</div></div>";

				status_text = status_text.replace(reg_ex, embedded_quote);

				StatusParser(status_text, function(parsed_status_text) {
					status_text = parsed_status_text;
					finished();
				});
			});

		});
	} else {
		callback(status_text);
	}
}

function get_status_text(id, callback) {

	noiysDatabase.findStatus(id, function(status) {
		var quoted_status_text = "<i>Status not found</i>";

		if (status) {
			var quoted_status_text = status.text;
		}

		callback(quoted_status_text, id);
	});

}
module.exports = StatusParser;