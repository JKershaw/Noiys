define(['noise-publish-status'], function(noisePublishStatus) {

	function publish(status, wrapper, prepend) {
		noisePublishStatus.publish_status(status, wrapper, prepend);
	}

	return {
		publish: publish
	}
});