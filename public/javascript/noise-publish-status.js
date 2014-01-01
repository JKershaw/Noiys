define(['jquery', 'noise-starred'], function($, noiseStarred) {

	function publish_status(status, wrapper, prepend) {

		$(wrapper + " #" + status.id).remove();

		if (prepend) {
			$(wrapper).prepend(generate_status_html(status, wrapper));
			$(wrapper + " div").first().hide().fadeIn();
		} else {
			console.debug("appending", status.id);
			$(wrapper + " .final").before(generate_status_html(status, wrapper));
			$(wrapper + " > div").show();
		}

		var quote_to_hide_selector = $(wrapper + " #" + status.id + " > div.panel-body > div.panel > div.panel-body > div.panel > div.panel-body > div.panel");

		if (quote_to_hide_selector) {
			quote_to_hide_selector.after("<div class=\"show_quote_link panel panel-default status_panel\"><div class=\"panel-body\"><a style=\"cursor:pointer\" class=\"button-show-hidden-quote\" data-id=\"" + status.id + "\" data-wrapper = \"" + wrapper + "\">Show quote</a></div></div>");
			quote_to_hide_selector.hide();
		}

		$("span.timeago").timeago();

	}

	function generate_status_html(status, wrapper) {

		var response_string = "";
		if (status.responses) {
			if (status.responses.length == 1) {
				response_string = "1 reply";
			} else {
				response_string = String(status.responses.length) + " replies";
			}

			responses_array_string = status.responses.join(",");

			response_string = "<a style=\"cursor:pointer\" class=\"button-show-replies\" data-wrapper=\"" + wrapper + "\" data-id=\"" + status.id + "\" data-responses-array=\"" + responses_array_string + "\">" + response_string + "</a>";

		}

		var hashtag_regex = /&#35;\w*/g

		status.text = status.text.replace(hashtag_regex, function(match) {
			return "<a style=\"cursor:pointer;\" class=\"button-search\" data-search-term=\"" + match + "\">" + match + "</a>";
		});

		var text_string = "<p>" + status.text + " </p>";

		var votes_string = "<span style=\"font-weight:bold;\" class=\"votes\">" + status.votes + "</span>";

		var verb_string = "<a style=\"cursor:pointer;\" class=\"button-vote\" data-id='" + status.id + "' >VERB</a>";

		var reply_string = "<a style=\"cursor:pointer\" class=\"button-reply\" data-id='" + status.id + "'><span class=\"glyphicon glyphicon-retweet\"></a>";

		var trash_string = "";

		if (wrapper == "#me_statuses") {
			trash_string = "<a style=\"cursor:pointer; float:right;\" class=\"button-remove-my-status\" data-id='" + status.id + "'><span class=\"glyphicon glyphicon-remove\"></span></a>";
		}

		if (noiseStarred.is_starred(status.id)) {
			var star_string = "<a style=\"cursor:pointer\" class=\"button-star\" data-id='" + status.id + "'><span id=\"star-" + status.id + "\"class=\"glyphicon glyphicon-star\"></a>";
		} else {
			var star_string = "<a style=\"cursor:pointer\" class=\"button-star\" data-id='" + status.id + "'><span id=\"star-" + status.id + "\"class=\"glyphicon glyphicon-star-empty\"></a>";
		}


		var timeago_string = "<small><span style=\"float:right;color:#888;\">posted <span class=\"timeago\" title=\"" + status.ISO8601timestamp + "\"></span></span></small>";


		return "<div style=\"display:none\" class=\"panel panel-default status_panel\" timestamp=\"" + status.timestamp + "\" id=\"" + status.id + "\"><div class=\"panel-body\">" + trash_string + "" + text_string + "<div class=\"row\"><div class=\"col-md-4\"><small>" + votes_string + "&nbsp;&nbsp;&nbsp;" + verb_string + "&nbsp;&nbsp;&nbsp;" + reply_string + "&nbsp;&nbsp;&nbsp;" + star_string + "</small></div><div class=\"col-md-4\" style=\"text-align:center\"><small>" + response_string + "</small></div><div class=\"col-md-4\">" + timeago_string + "</div></div><div class=\"responses\"></div></div>";
	}

	return {
		publish_status: publish_status
	}
});