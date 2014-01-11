define(['jquery', 'noise-starred', 'noiys-vote', 'noiys-ui', 'noise-starred'], function($, noiseStarred, noiysVote, noiysUi, noiseStarred) {

	function publish_status(status, wrapper, prepend) {

		if (prepend) {
			$(wrapper).prepend(status.html);
			$(wrapper + " div").first().hide().fadeIn();
		} else {
			$(wrapper + " .final").before(status.html);
			$(wrapper + " > div").show();
		}
		
		noiseStarred.update_star_html(status.id);
		$("span.timeago").timeago();
	}

	function append_status(status, wrapper, selectorToAppendTo) {
		
		$(selectorToAppendTo).append(status.replyHtml);
		//$(wrapper + " #" + statusIDToAppendTo + " ul li div").slideDown();
		
		noiseStarred.update_star_html(status.id);
		$("span.timeago").timeago();
	}

	return {
		publish_status: publish_status,
		append_status: append_status
	}
});