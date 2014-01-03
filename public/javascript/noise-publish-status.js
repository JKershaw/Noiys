define(['jquery', 'noise-starred'], function($, noiseStarred) {

	function publish_status(status, wrapper, prepend) {

		$(wrapper + " #" + status.id).remove();

		if (prepend) {
			$(wrapper).prepend(generate_status_html(status, wrapper));
			$(wrapper + " div").first().hide().fadeIn();
		} else {
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

	function replace_status(status, wrapper, statusIDToReplace) {


		$(wrapper + " #" + statusIDToReplace).before(generate_status_html(status, wrapper));
		$(wrapper + " #" + status.id).fadeIn();
		$(wrapper + " #" + statusIDToReplace).hide();

		var quote_to_hide_selector = $(wrapper + " #" + status.id + " > div.panel-body > div.panel > div.panel-body > div.panel > div.panel-body > div.panel");

		if (quote_to_hide_selector) {
			quote_to_hide_selector.after("<div class=\"show_quote_link panel panel-default status_panel\"><div class=\"panel-body\"><a style=\"cursor:pointer\" class=\"button-show-hidden-quote\" data-id=\"" + status.id + "\" data-wrapper = \"" + wrapper + "\">Show quote</a></div></div>");
			quote_to_hide_selector.hide();
		}

		$("span.timeago").timeago();
	}

	function generate_status_html(status, wrapper) {

		

		var hashtag_regex = /&#35;\w*/g

		status.text = status.text.replace(hashtag_regex, function(match) {
			return "<a style=\"cursor:pointer;\" class=\"button-search\" data-search-term=\"" + match + "\">" + match + "</a>";
		});


		var trash_string = "";

		if (wrapper == "#me_statuses") {
			trash_string = "<a style=\"cursor:pointer; float:right;\" class=\"button-remove-my-status\" data-id='" + status.id + "'><span class=\"glyphicon glyphicon-remove\"></span></a>";
		}

		var text_string = status.text;

		var icon_row = get_icon_row_html(status, wrapper);

		var status_html = " \
		<div style=\"display:none\" class=\"panel panel-default status_panel id-" + status.id + "\" timestamp=\"" + status.timestamp + "\" id=\"" + status.id + "\"> \
			<div class=\"panel-body\"> \
				" + trash_string + text_string + " \
			</div> \
			" + icon_row + " \
			<div class=\"responses\"></div> \
		</div>";

		return status_html;
	}

	function get_icon_row_html(status, wrapper) {

		console.debug("get_icon_row_html: ", status, wrapper);
		var response_string = "";
		var votes_string = "";
		var verb_string = "";
		var star_string = "";
		var timeago_string = "";

		if (status.responses !== undefined) {
			if (status.responses.length == 1) {
				response_string = "1 reply";
			} else {
				response_string = String(status.responses.length) + " replies";
			}

			responses_array_string = status.responses.join(",");

			response_string = "<a style=\"cursor:pointer\" class=\"button-show-replies\" data-wrapper=\"" + wrapper + "\" data-id=\"" + status.id + "\" data-responses-array=\"" + responses_array_string + "\">" + response_string + "</a>";

		}

		if (status.votes !== undefined) {
			votes_string = "<span style=\"font-weight:bold;\" class=\"votes votes-" + status.id + "\">" + status.votes + "</span>&nbsp;&nbsp;";
			verb_string = "<a style=\"cursor:pointer;\" class=\"button-vote\" data-id='" + status.id + "' >VERB</a>&nbsp;&nbsp;";
		}

		if (status.ISO8601timestamp !== undefined) {
			timeago_string = "<small><span style=\"float:right;color:#888;\">posted <span class=\"timeago\" title=\"" + status.ISO8601timestamp + "\"></span></span></small>";
		}
		
		if (noiseStarred.is_starred(status.id)) {
			star_string = "<a style=\"cursor:pointer\" class=\"button-star\" data-id='" + status.id + "'><span id=\"star-" + status.id + "\"class=\"star-" + status.id + " glyphicon glyphicon-star\"></a>";
		} else {
			star_string = "<a style=\"cursor:pointer\" class=\"button-star\" data-id='" + status.id + "'><span id=\"star-" + status.id + "\"class=\"star-" + status.id + " glyphicon glyphicon-star-empty\"></a>";
		}

		var reply_string = "<a style=\"cursor:pointer\" class=\"button-reply\" data-id='" + status.id + "'><span class=\"glyphicon glyphicon-retweet\"></a>";
		
		var link_string = "<a class=\"button-link\" target=\"_blank\" href=\"status/" + status.id + "\"><span class=\"glyphicon glyphicon-link\"></a>";

		return "<ul class=\"list-group\"><li class=\"list-group-item\"> \
				<div class=\"row\"> \
					<div class=\"col-md-4\"> \
						<small> \
							" + votes_string + " \
							" + verb_string + " \
							" + reply_string + "&nbsp;&nbsp; \
							" + star_string + "&nbsp;&nbsp; \
							" + link_string + " \
						</small> \
					</div> \
					<div class=\"col-md-4\" style=\"text-align:center\"> \
						<small> \
							" + response_string + " \
						</small> \
					</div> \
					<div class=\"col-md-4\"> \
						" + timeago_string + " \
					</div>  \
				</div> \
			</li></ul>";
	}

	return {
		publish_status: publish_status,
		replace_status: replace_status,
		get_icon_row_html: get_icon_row_html
	}
});