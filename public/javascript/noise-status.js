define(['noise-publish-status', 'noise-api'], function(noisePublishStatus, noiysApi) {

	function publish(status, wrapper, prepend) {
		noisePublishStatus.publish_status(status, wrapper, prepend);
	}

	function replace(status, wrapper, statusIDToReplace) {
		noisePublishStatus.replace_status(status, wrapper, statusIDToReplace);
	}

	function get_icon_row_html(status, wrapper) {
		return noisePublishStatus.get_icon_row_html(status, wrapper)
	}

	function post(status_text, callback) {
		noiysApi.postStatus(status_text, function(posted) {
			callback(posted);
		});
	}

	return {
		get_icon_row_html: get_icon_row_html,
		publish: publish,
		replace: replace,
		post: post
	}
});