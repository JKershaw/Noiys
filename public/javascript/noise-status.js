define(['underscore', 'noise-publish-status', 'noise-api', 'noiys-ui', 'noise-starred'], function(_, noisePublishStatus, noiysApi, noiysUi, noiseStarred) {

	function publish(status, wrapper, prepend) {
		noisePublishStatus.publish_status(status, wrapper, prepend);
	}

	function post(status_text, callback) {
		noiysApi.postStatus(status_text, function(posted) {
			callback(posted);
		});
	}

	function show_replies(selector, wrapper) {

		var status_id = $(selector).attr('data-id');
		var replies_ids = $(selector).attr('data-responses-array').split(",");

		var selectorToAppendTo = $(selector).closest(".panel");
		
		var selector_parent = $(selector).parent();
		$(selector_parent).html('Loading ...');
		
		var finished = _.after(replies_ids.length, function() {
			$(selector_parent).html('Loaded!').fadeOut(1000);
		});

		_.each(replies_ids, function(reply_id){
			noiysApi.getStatus(reply_id, function(status) {
				noisePublishStatus.append_status(status, wrapper, selectorToAppendTo);
				finished();
			});
		});
	}

	function toggle_icon_row(selector) {
		if ($(selector).next().is(":visible"))
		{
			$(selector).next().slideUp('fast');
		} else {
			$(selector).next().show();
			$("span.timeago").timeago();
		}
	}

	function show_older_notes(selector) {
		$(selector).parent().siblings(".list-status").fadeIn();
		$(selector).parent().hide();
	}


	return {
		toggle_icon_row: toggle_icon_row,
		publish: publish,
		post: post,
		show_replies: show_replies,
		show_older_notes: show_older_notes
	}
});