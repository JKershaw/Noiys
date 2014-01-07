define(['jquery'], function($) {

	function show_error() {
		var error_text="Ah crap, lost connection to the server. It'll probably come back soon.";
		$("#main_error").html(error_text).show();
	}

	function hide_error() {
		$("#main_error").hide();
	}

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

	function generate_trash_html(id) {
		return "<a style=\"float:right;\" class=\"button-remove-my-status\" data-id='" + id + "'> \
					<span class=\"glyphicon glyphicon-remove\"></span> \
				</a>";
	}

	function generate_reply_html(id) {
		return "<a class=\"button-reply\" data-id='" + id + "'><span class=\"glyphicon glyphicon-retweet\"></a>";
	}

	function generate_link_html(id) {
		return "<a class=\"button-link\" target=\"_blank\" href=\"status/" + id + "\"><span class=\"glyphicon glyphicon-link\"></a>";
	}

	return {
		show_error: show_error,
		hide_error: hide_error,

		generate_verb_html: generate_verb_html,
		generate_timeago_html: generate_timeago_html,
		generate_star_html: generate_star_html,
		generate_responses_html: generate_responses_html,
		generate_show_quote_html: generate_show_quote_html,
		generate_hashtag_replacement_html: generate_hashtag_replacement_html,
		generate_trash_html:generate_trash_html,
		generate_reply_html: generate_reply_html,
		generate_link_html: generate_link_html
	}
});