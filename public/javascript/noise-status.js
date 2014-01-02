define(['noise-publish-status'], function(noisePublishStatus) {

	function publish(status, wrapper, prepend) {
		noisePublishStatus.publish_status(status, wrapper, prepend);
	}

	function replace(status, wrapper, statusIDToReplace) {
		noisePublishStatus.replace_status(status, wrapper, statusIDToReplace);
	}

	return {
		publish: publish,
		replace: replace
	}
});