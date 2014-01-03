define(['noise-publish-status'], function(noisePublishStatus) {

	function publish(status, wrapper, prepend) {
		noisePublishStatus.publish_status(status, wrapper, prepend);
	}

	function replace(status, wrapper, statusIDToReplace) {
		noisePublishStatus.replace_status(status, wrapper, statusIDToReplace);
	}

	function get_icon_row_html(status, wrapper) {
		return noisePublishStatus.get_icon_row_html(status, wrapper)
	}

	return {
		get_icon_row_html: get_icon_row_html,
		publish: publish,
		replace: replace
	}
});