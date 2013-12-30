define(['jquery'], function($) {

	// Refactoring all the API calls to here


	function postStatus(statusText, callback) {
		$.ajax({
			url: '/status',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({
				text: statusText
			}),
			complete: function(xhr, status) {
				callback(xhr);
			}
		});
	}

	return {
		postStatus: postStatus
	}
});