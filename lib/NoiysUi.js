var NoiysUi = function() {

		function generate_verb_html(id, vote_count) {

			var verb_html = "";

			if (vote_count !== undefined) {
				verb_html = "<span style=\"font-weight:bold;\" class=\"votes votes-" + id + "\">" + vote_count + "</span>&nbsp;&nbsp; \
					<a class=\"button-vote\" data-id='" + id + "' >VERB</a>&nbsp;&nbsp;";
			}
			
			return verb_html;
		}

		function generate_timeago_html(ISO8601timestamp) {
			var timeago_html = "";

			if (ISO8601timestamp !== undefined) {
				timeago_html = "<small><span style=\"float:right;color:#888;\">posted <span class=\"timeago\" title=\"" + ISO8601timestamp + "\"></span></span></small>";
			} 

			return timeago_html;
		}

		function generate_star_html(id) {
			return "<a class=\"button-star\" data-id='" + id + "'><span class=\"star-" + id + " glyphicon glyphicon-star-empty\"></a>";
		}

		function generate_hide_html(id) {
			return "<a class=\"button-hide\" data-id='" + id + "'><span class=\"hide-" + id + " glyphicon glyphicon-eye-close\"></a>";
		}

		function generate_responses_html(id, responses) {
			if (responses !== undefined) {

				var response_string = "";

				if (responses.length == 1) {
					response_string = "1 reply";
				} else {
					response_string = String(responses.length) + " replies";
				}

				responses_array_string = responses.join(",");

				return "<a class=\"button-show-replies\" data-id=\"" + id + "\" data-responses-array=\"" + responses_array_string + "\">" + response_string + "</a>";

			} else {
				return "";
			}
		}

		function generate_trash_html(id) {
			return "<small><span class=\"trash_icon_wrapper\" style=\"float:right;color:#888;\"> \
					&nbsp;<a class=\"button-remove-my-status\" data-id='" + id + "'> \
						<span class=\"glyphicon glyphicon-remove\"></span> \
					</a> \
				</span></small>";
		}

		function generate_reply_html(id) {
			return "<a class=\"button-reply\" data-id='" + id + "'><span class=\"glyphicon glyphicon-retweet\"></a>";
		}

		function generate_link_html(id) {
			return "<a class=\"button-link\" target=\"_blank\" href=\"status/" + id + "\"><span class=\"glyphicon glyphicon-link\"></a>";
		}


		function generate_icon_row_html(status, hidden) {

			if (status.id) {

				var vote_string = generate_verb_html(status.id, status.votes);
				var reply_string = generate_reply_html(status.id);
				var star_string = generate_star_html(status.id);
				var hide_string = generate_hide_html(status.id);
				var link_string = generate_link_html(status.id);

				var response_string = generate_responses_html(status.id, status.responses);

				if (!status.ISO8601timestamp && status.timestamp) {
					var date = new Date(status.timestamp * 1000);
					status.ISO8601timestamp = date.toISOString();
				}
				
				var timeago_string = generate_timeago_html(status.ISO8601timestamp);
				var trash_string = generate_trash_html(status.id);

				var hidden_string = "";
				if (hidden) {
					hidden_string = " style=\"display: none\"";
				}

				return "<li" + hidden_string + " class=\"list-group-item list-icon-row\"> \
					<div class=\"row\"> \
						<div class=\"col-md-4\"> \
							<small> \
								" + vote_string + " \
								" + reply_string + "&nbsp;&nbsp; \
								" + star_string + "&nbsp;&nbsp; \
								" + hide_string + "&nbsp;&nbsp; \
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
					</li>";

			} else {
				return "";
			}
		}

		function generate_status_html(status, hidden_everything, hidden_icon_bar) {

			var icon_row = generate_icon_row_html(status, hidden_icon_bar);

			var hidden_everything_string = "";
			if (hidden_everything) {
				hidden_everything_string = " style=\"display: none\"";
			}

			var status_html = " \
				<div" + hidden_everything_string + " class=\"panel panel-default status_panel id-" + status.id + "\" timestamp=\"" + status.timestamp + "\" id=\"" + status.id + "\" data-ancestorID=\"" + status.ancestor + "\" data-noteID=\"" + status.id + "\"> \
					<div class=\"panel-body\">" + status.html + "</div> \
					<ul class=\"list-group\">" + icon_row + "</ul> \
				</div>";

			return status_html;
		}

		function generate_status_as_reply_html(status) {

			var icon_row = generate_icon_row_html(status, true);


			var status_as_reply_html = " \
				<ul class=\"list-group\" data-ancestorID=\"" + status.ancestor + "\" data-noteID=\"" + status.id + "\" > \
					<li class=\"list-group-item list-status\">" + status.html + "</li> \
					" + icon_row + " \
				</ul>";

			return status_as_reply_html;
		}
						
		return {
			generate_icon_row_html: generate_icon_row_html,
			generate_status_html: generate_status_html,
			generate_status_as_reply_html: generate_status_as_reply_html
		}
	}

module.exports = NoiysUi;