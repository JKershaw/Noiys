define(['noise-publish-status', 'noise-api', 'noiys-ui'], function(noisePublishStatus, noiysApi, noiysUi) {

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
		if (($(selector).siblings().size() > 0))
		{
			$(selector).siblings('.list-group').slideUp('fast', function(){
				$(selector).siblings('.list-group').remove();
			});
		} else {

			var status = {
					id: $(selector).parent().attr('data-id'),
					votes: $(selector).parent().attr('data-votes'),
					ISO8601timestamp: $(selector).parent().attr('data-ISO8601timestamp')
				};
				
			var extra_bar = noiysUi.generate_icon_row_html(status, "");

			$(selector).parent().append(extra_bar);

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