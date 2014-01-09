define(['noise-publish-status', 'noise-api', 'noiys-ui', 'noise-starred'], function(noisePublishStatus, noiysApi, noiysUi, noiseStarred) {

	function publish(status, wrapper, prepend) {
		noisePublishStatus.publish_status(status, wrapper, prepend);
	}

	function replace(status, wrapper, statusIDToReplace) {
		noisePublishStatus.replace_status(status, wrapper, statusIDToReplace);
	}

	function post(status_text, callback) {
		noiysApi.postStatus(status_text, function(posted) {
			callback(posted);
		});
	}

	function show_replies(status_id, wrapper, replies_ids) {
		for (var i = 0; i < replies_ids.length; i++) {
			noiysApi.getStatus(replies_ids[i], function(status) {
				replace(status, wrapper, status_id);
			});
		}
	}

	function toggle_icon_row(selector) {
		if ($(selector).siblings('.list-group').is(":visible"))
		{
			$(selector).siblings('.list-group').slideUp('fast');
		} else {
			$(selector).siblings('.list-group').show();
			$("span.timeago").timeago();
		}
	}


	return {
		toggle_icon_row: toggle_icon_row,
		publish: publish,
		replace: replace,
		post: post,
		show_replies: show_replies
	}
});