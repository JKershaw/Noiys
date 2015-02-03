define(['jquery', 'noise-starred', 'noiys-vote', 'noise-hider'], function($, noiseStarred, noiysVote, noiysHider) {

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
		noiysHider.hide_all_hidden();
	}

	function append_status(status, selectorToAppendTo) {
		
		$(selectorToAppendTo).append(status.replyHtml);
		
		noiseStarred.update_star_html(status.id);
		$("span.timeago").timeago();
		noiysHider.hide_all_hidden();
	}

	function prepend_status(status, selectorToPrependTo) {
		
		$(selectorToPrependTo).prepend(status.parentHtml);
		
		noiseStarred.update_star_html(status.id);
		$("span.timeago").timeago();
		noiysHider.hide_all_hidden();
	}

	return {
		publish_status: publish_status,
		append_status: append_status,
		prepend_status: prepend_status
	}
});