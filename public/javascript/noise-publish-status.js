define(['jquery', 'noise-starred', 'noiys-vote', 'noiys-ui'], function($, noiseStarred, noiysVote, noiysUi) {

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
			quote_to_hide_selector.after(noiysUi.generate_show_quote_html(status.id, wrapper));
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
			quote_to_hide_selector.after(noiysUi.generate_show_quote_html(status.id, wrapper));
			quote_to_hide_selector.hide();
		}

		$("span.timeago").timeago();
	}

	function generate_status_html(status, wrapper) {

		var hashtag_regex = /&#35;\w*/g

		status.text = status.text.replace(hashtag_regex, function(match) {
			return noiysUi.generate_hashtag_replacement_html(match);
		});

		var trash_string = "";

		if (wrapper == "#me_statuses") {
			trash_string = noiysUi.generate_trash_html(status.id);
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

		var votes_string = noiysVote.get_verb_and_vote_html(status.id, status.votes);
		var reply_string = noiysUi.generate_reply_html(status.id);
		var star_string = noiysUi.generate_star_html(status.id, noiseStarred.is_starred(status.id));
		var link_string = noiysUi.generate_link_html(status.id);

		var response_string = noiysUi.generate_responses_html(status.responses, status.id, wrapper);
		var timeago_string = noiysUi.generate_timeago_html(status.ISO8601timestamp);
		
		return "<ul class=\"list-group\"><li class=\"list-group-item\"> \
				<div class=\"row\"> \
					<div class=\"col-md-4\"> \
						<small> \
							" + votes_string + " \
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