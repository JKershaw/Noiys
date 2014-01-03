var NoiysDatabase = require('../lib/NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._;

var StatusParser = function(status_text, callback) {

		parse_quote(status_text, 0, function(status_text){
			parse_link(status_text, function(status_text){
				callback(status_text);
			});
		});
	}


function parse_quote(status_text, depth, callback) {

		var quotes = status_text.match(/@[a-f0-9]{24,24}/g);

		if (quotes !== null) {

			var finished = _.after(quotes.length, function() {
				callback(status_text);
			});

			_.each(quotes, function(quote) {

				quoted_status_id = String(quote).replace("@", "");

				get_status_text(quoted_status_id, function(found_quoted_status_text, original_id) {

					var reg_ex = "@" + original_id;
					var embedded_quote = "<div data-id=\"" + quoted_status_id + "\" class=\"panel panel-default\"><div class=\"panel-body\">" + found_quoted_status_text + "</div></div>";
					
					status_text = status_text.replace(reg_ex, embedded_quote);

					if (depth < 6) {
						parse_quote(status_text, depth + 1, function(parsed_status_text) {
							status_text = parsed_status_text;
							finished();
						});
					} else {
						finished();
					}
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

function parse_link(status_text, callback) {
	var exp = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    status_text = status_text.replace(exp,"<a href=\"$1\" target=\"_blank\" rel=\"nofollow\">$1</a>"); 
    callback(status_text);
}
module.exports = StatusParser;