define(['jquery', 'noise-starred', 'noiys-vote', 'noiys-ui', 'noise-starred'], function($, noiseStarred, noiysVote, noiysUi, noiseStarred) {

	function publish_status(status, wrapper, prepend) {

		if (prepend) {
			$(wrapper).prepend(noiysUi.generate_status_html(status));
			$(wrapper + " div").first().hide().fadeIn();
		} else {
			$(wrapper + " .final").before(noiysUi.generate_status_html(status));
			$(wrapper + " > div").show();
		}
		
		noiseStarred.update_star_html(status.id);

		$("span.timeago").timeago();
	}

	function replace_status(status, wrapper, statusIDToReplace) {

		$(wrapper + " #" + statusIDToReplace).before(noiysUi.generate_status_html(status));
		$(wrapper + " #" + status.id).fadeIn();
		$(wrapper + " #" + statusIDToReplace).hide();
		
		noiseStarred.update_star_html(status.id);

		$("span.timeago").timeago();
	}

	

	return {
		publish_status: publish_status,
		replace_status: replace_status
	}
});