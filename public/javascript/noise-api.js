define(['jquery'], function($) {

	function getStatus(statusID, callback)
	{
		console.log("Woooo!");
		callback();
	}

	return {
		getStatus: getStatus
	}
});