define(['jquery', 'noise-starred', 'noiys-vote', 'noiys-ui'], function($, noiseStarred, noiysVote, noiysUi) {

	function publish_status(status, wrapper, prepend) {

		$(wrapper + " #" + status.id).remove();

		if (prepend) {
			$(wrapper).prepend(noiysUi.generate_status_html(status, wrapper));
			$(wrapper + " div").first().hide().fadeIn();
		} else {
			$(wrapper + " .final").before(noiysUi.generate_status_html(status, wrapper));
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


		$(wrapper + " #" + statusIDToReplace).before(noiysUi.generate_status_html(status, wrapper));
		$(wrapper + " #" + status.id).fadeIn();
		$(wrapper + " #" + statusIDToReplace).hide();

		var quote_to_hide_selector = $(wrapper + " #" + status.id + " > div.panel-body > div.panel > div.panel-body > div.panel > div.panel-body > div.panel");

		if (quote_to_hide_selector) {
			quote_to_hide_selector.after(noiysUi.generate_show_quote_html(status.id, wrapper));
			quote_to_hide_selector.hide();
		}

		$("span.timeago").timeago();
	}

	

	return {
		publish_status: publish_status,
		replace_status: replace_status
	}
});