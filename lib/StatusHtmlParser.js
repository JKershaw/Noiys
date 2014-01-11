var NoiysDatabase = require('../lib/NoiysDatabase'),
	noiysDatabase = new NoiysDatabase(process.env.MONGO_CONNECTION_STRING),
	_ = require("underscore")._,
	NoiysUi = require('./NoiysUi'),
	noiysUi = new NoiysUi();

var StatusHtmlParser = function(status, callback) {

		status_text = status.text;

		parse_text(status_text,  function(status_text) {
			
			status.html = status_text;

			if (status.parent) {
				get_status_inc_deleted(status.parent, function(parent_status){
					parse_prior_conversation(parent_status, 0, function(parent_html) {

						status_replyHtml = noiysUi.generate_status_as_reply_html(status, true, false);
						
						status.html = "<ul class=\"list-group\">" + parent_html + "</ul>" + status.html;
						status_html = noiysUi.generate_status_html(status, true, false);

						callback(status_html, status_replyHtml);

					});

				});
			} else {
				status_html = noiysUi.generate_status_html(status, true, false);
				status_replyHtml = noiysUi.generate_status_as_reply_html(status, true, false);

				callback(status_html, status_replyHtml);
			}
		});
	}

function parse_text(status_text, callback) {

	status_text = String(status_text).replace(/@[a-f0-9]{24,24}\n/g, "");
	status_text = String(status_text).replace(/@[a-f0-9]{24,24}/g, "");

	
	parse_link(status_text, function(status_text) {
		parse_nl2br(status_text, function(status_text) {
			process_hashtags(status_text,  function(status_text) {
				
				status_text = rainbow_filter(status_text);
	

				callback(status_text);
			});
		});
	});
}

function rainbow_filter(text) {

	if (text.toLowerCase().indexOf("&#35;rainbow") != -1) {

		var rainbow_text = "";
		var rainbow_offset = Math.floor(Math.random() * 360);

		for (var i = 0; i < text.length; i++) {

			if (text[i] == "&")
			{
				
				i_offset = text.substring(i).indexOf(";");
				rainbow_text = rainbow_text + text.substring(i, i + i_offset + 1);
				i = i + i_offset;

			} else {

				if (text[i] == "<")
				{
					
					i_offset = text.substring(i).indexOf(">");
					rainbow_text = rainbow_text + text.substring(i, i + i_offset + 1);
					i = i + i_offset;

				} else {

					var iC = text[i].charCodeAt();
					
					if ((iC < 65 || iC > 127 || (iC > 90 && iC < 97)) && (iC < 47 || iC > 58) && (iC != 20) && (iC != 32) && (iC != 10) && (iC != 64)) {
						rainbow_text = rainbow_text + text[i];
					} else {
						rainbow_offset++;
						var hsl_value = String(((rainbow_offset) * 5) % 360);
						rainbow_text = rainbow_text + "<span style=\"color: hsl(" + hsl_value + ", 100%, 35%);\">" + text[i] + "</span>";
					}
				}
			}
		}

		return rainbow_text;

	} else {
		return text;
	}

}

function parse_prior_conversation(status, depth, callback) {

	var noiysUi = new NoiysUi();

	var depth_to_show = 2;

	var display_style = "block"
	if (depth >= depth_to_show) {
		display_style = "none"
	}

	var current_html = "";

	if (depth == depth_to_show) {
		current_html = "<li class=\"list-group-item list-show-older\"><a class=\"button-show-older-notes\" style=\"font-style:italic\">Show conversation</a></li>"
	}
	
	parse_text(status.text,  function(status_text) {


		if (!status.parent) {
			current_html = current_html + "<li style=\"display: "+ display_style + ";\" class=\"list-group-item list-status\">" + status_text + "</li>";
			status.responses = undefined;
			if (status.id) {
				current_html = current_html + noiysUi.generate_icon_row_html(status, true);
			}
			callback(current_html);
		} else {
			get_status_inc_deleted(status.parent, function(parent_status){
				parse_prior_conversation(parent_status, depth + 1, function(parent_html){

					current_html = current_html + parent_html + "<li style=\"display: "+ display_style + ";\" class=\"list-group-item list-status\">" + status_text + "</li>";
					status.responses = undefined;
					if (status.id) {
						current_html = current_html + noiysUi.generate_icon_row_html(status, true);
					}
					callback(current_html);
				});
			});
		}
	});
}

function get_status_inc_deleted(id, callback) {

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


function process_hashtags(status_text, callback) {
	var hashtag_regex = /&#35;\w*/g

	status_text = status_text.replace(hashtag_regex, function(match) {
		return generate_hashtag_replacement_html(match);
	});

	callback(status_text);
}

function generate_hashtag_replacement_html(hashtag_string) {
	return "<a class=\"button-search\" data-search-term=\"" + hashtag_string + "\">" + hashtag_string + "</a>";
}
module.exports = StatusHtmlParser;