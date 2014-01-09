var NoiysDatabase = require('../lib/NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._,
	NoiysUi = require('./NoiysUi'),
	noiysUi = new NoiysUi();

var StatusHtml2Parser = function(status, callback) {

		status_text = status.text;

		parse_quote(status_text, 0, function(status_text) {
			parse_link(status_text, function(status_text) {
				parse_nl2br(status_text, function(status_text) {

					status.html = process_hashtags(status_text);
					status.html = " \
					<div class=\"panel-body\"> \
						" + status.html + " \
					</div>";

					status_html = noiysUi.generate_status_html(status, true, false);

					callback(status_html);
				});
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

			get_status_text(quoted_status_id, function(status, original_id) {


				var found_quoted_status_text = status.text;
				
				console.log(found_quoted_status_text);


				if (status.timestamp !== undefined) {
					var date = new Date(status.timestamp * 1000);
					status.ISO8601timestamp = date.toISOString();
				}

				var reg_ex = "@" + original_id;

				status.html = "<div class=\"panel-body\">" + found_quoted_status_text + "</div>";
				embedded_quote = noiysUi.generate_status_html(status, false, true);
				

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


		if (!status) {

			var oldNoteMessages = ["This Note is not.", "It's worse than that, it's dead, Jim.", "Note deleted.", "Note expired.", "Your Note is in another castle.", "Note traversed to the void.", "Note eliminated.", "This Note's life clock has expired.", "Too late; Note died of old age.", "Like a mayfly, this Note has lived a brief, bright life, and has now moved on.", "Note tried to swim in lava.", "Note shot by skeleton.", "This Note is dead, Dave.", "Note recycled.", "Note valiantly fell in battle.", "Note deaded.", "Note no more.", "Note not.", "Note dissolved.", "Note lost to the universe.", "Note has been dispatched by digital ninjas.", "Note was eaten by a grue.", "Note taped over.", "Note exploded.", "Note incinerated.", "Note imploded.", "Note evaporated.", "Note dismantled for scrap.", "Note parts being reused.", "Note consumed iocane powder, INCONCEIVABLE!", "Note was banished to Carmarthen.", "Note was left in a communal fridge by a guest, went off, and was eventually thrown out by someone's mum.", "Note's passed on! This note is no more! He has ceased to be! Note's expired and gone to meet 'is maker! Note's a stiff! Bereft of life, 'e rests in peace! If you hadn't nailed 'im to the perch 'e'd be pushing up the daisies! Note's metabolic processes are now 'istory! Note's off the twig! 'Note's kicked the bucket, Note's shuffled off 'is mortal coil, run down the curtain and joined the bleedin' choir invisible!! THIS IS AN EX-NOTE!", "Note has journeyed to Avalon.", "Note has ascended to Valhalla.", "Note spoke loudly about a conspiracy theory in range of a man in dark glasses and has not been seen since."];

			status = {
				text: "<i>" + oldNoteMessages[Math.floor(Math.random() * oldNoteMessages.length)] + "</i> \
						<br /> \
						<small> \
							<span style=\"color: #888;\"> \
								This Note has been deleted automatically as it was published more than 24 hours ago. \
							</span> \
						</small>"
			};
		}

		callback(status, id);
	});

}

function parse_link(status_text, callback) {
	var exp = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	status_text = status_text.replace(exp, "<a href=\"$1\" target=\"_blank\" rel=\"nofollow\">$1</a>");
	callback(status_text);
}

function parse_nl2br(status_text, callback) {
	var exp = /\n/g;
	status_text = status_text.replace(exp, "<br />");
	callback(status_text);
}


function process_hashtags(status_text) {
	var hashtag_regex = /&#35;\w*/g

	return status_text.replace(hashtag_regex, function(match) {
		return generate_hashtag_replacement_html(match);
	});
}

function generate_hashtag_replacement_html(hashtag_string) {
	return "<a class=\"button-search\" data-search-term=\"" + hashtag_string + "\">" + hashtag_string + "</a>";
}
module.exports = StatusHtml2Parser;