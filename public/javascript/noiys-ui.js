define(['jquery', 'noiys-vote', 'noise-starred'], function($, noiysVote, noiseStarred) {

	function generate_verb_html(id, vote_count) {
		if (vote_count !== undefined) {
			return  "<span style=\"font-weight:bold;\" class=\"votes votes-" + id + "\">" + vote_count + "</span>&nbsp;&nbsp; \
					<a class=\"button-vote\" data-id='" + id + "' >VERB</a>&nbsp;&nbsp;";
		} else {
			return "";
		}
	}

	function generate_timeago_html(ISO8601timestamp) {
		if (ISO8601timestamp !== undefined) {
			return "<small><span style=\"float:right;color:#888;\">posted <span class=\"timeago\" title=\"" + ISO8601timestamp + "\"></span></span></small>";
		} else {
			return "";
		}
	}

	function generate_star_html(id, is_starred) {
		if (is_starred) {
			return "<a class=\"button-star\" data-id='" + id + "'><span id=\"star-" + id + "\"class=\"star-" + id + " glyphicon glyphicon-star\"></a>";
		} else {
			return "<a class=\"button-star\" data-id='" + id + "'><span id=\"star-" + id + "\"class=\"star-" + id + " glyphicon glyphicon-star-empty\"></a>";
		}
	}

	function generate_responses_html(responses, id, wrapper) {
		if (responses !== undefined) {

			var response_string = "";

			if (responses.length == 1) {
				response_string = "1 reply";
			} else {
				response_string = String(responses.length) + " replies";
			}

			responses_array_string = responses.join(",");

			return "<a class=\"button-show-replies\" data-wrapper=\"" + wrapper + "\" data-id=\"" + id + "\" data-responses-array=\"" + responses_array_string + "\">" + response_string + "</a>";

		} else {
			return "";
		}
	}

	function generate_show_quote_html(id, wrapper) {
		return "<div class=\"show_quote_link panel panel-default status_panel\"> \
					<div class=\"panel-body\"> \
						<a class=\"button-show-hidden-quote\" data-id=\"" + id + "\" data-wrapper = \"" + wrapper + "\"> \
							Show quote \
						</a> \
					</div> \
				</div>";
	}

	function generate_hashtag_replacement_html(hashtag_string){
		return "<a class=\"button-search\" data-search-term=\"" + hashtag_string + "\">" + hashtag_string + "</a>";
	}

	function generate_trash_html(id, wrapper) {
		if (wrapper == "#me_statuses") {
			return "<small><span style=\"float:right;color:#888;\"> \
						&nbsp;<a class=\"button-remove-my-status\" data-id='" + id + "'> \
							<span class=\"glyphicon glyphicon-remove\"></span> \
						</a> \
					</span></small>";
		} else {
			return "";
		}
	}

	function generate_reply_html(id) {
		return "<a class=\"button-reply\" data-id='" + id + "'><span class=\"glyphicon glyphicon-retweet\"></a>";
	}

	function generate_link_html(id) {
		return "<a class=\"button-link\" target=\"_blank\" href=\"status/" + id + "\"><span class=\"glyphicon glyphicon-link\"></a>";
	}

	function generate_status_html(status, wrapper) {

		var status_text = process_hashtags(status.text);
		var icon_row = generate_icon_row_html(status, wrapper);

		var status_html = " \
		<div style=\"display:none\" class=\"panel panel-default status_panel id-" + status.id + "\" timestamp=\"" + status.timestamp + "\" id=\"" + status.id + "\"> \
			<div class=\"panel-body\"> \
				" + status_text + " \
			</div> \
			" + icon_row + " \
			<div class=\"responses\"></div> \
		</div>";

		return status_html;
	}


	function generate_icon_row_html(status, wrapper) {

		noiysVote.save_vote_count(status.id, status.votes);

		var vote_string = generate_verb_html(status.id, status.votes);
		var reply_string = generate_reply_html(status.id);
		var star_string = generate_star_html(status.id, noiseStarred.is_starred(status.id));
		var link_string = generate_link_html(status.id);

		var response_string = generate_responses_html(status.responses, status.id, wrapper);

		var timeago_string = generate_timeago_html(status.ISO8601timestamp);
		var trash_string = generate_trash_html(status.id, wrapper);

		
		return "<ul class=\"list-group\"><li class=\"list-group-item\"> \
				<div class=\"row\"> \
					<div class=\"col-md-4\"> \
						<small> \
							" + vote_string + " \
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
						" + trash_string + " " + timeago_string + " \
					</div>  \
				</div> \
				</li></ul>";
	}

	function process_hashtags(status_text) {
		var hashtag_regex = /&#35;\w*/g

		return status_text.replace(hashtag_regex, function(match) {
			return generate_hashtag_replacement_html(match);
		});
	}

	return {
		generate_verb_html: generate_verb_html,
		generate_timeago_html: generate_timeago_html,
		generate_star_html: generate_star_html,
		generate_responses_html: generate_responses_html,
		generate_show_quote_html: generate_show_quote_html,
		generate_hashtag_replacement_html: generate_hashtag_replacement_html,
		generate_trash_html:generate_trash_html,
		generate_reply_html: generate_reply_html,
		generate_link_html: generate_link_html,

		generate_icon_row_html: generate_icon_row_html,
		generate_status_html: generate_status_html
	}
});