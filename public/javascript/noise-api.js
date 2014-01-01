define(['jquery'], function($) {

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

	function postVote(statusID, callback){
		$.ajax({
			url: '/vote',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({
				id: statusID
			}),
			complete: function(xhr, status) {
				callback();
			}
		});
	}

	function getStatusRandom(callback) {
		$.get("status", function(status) {
			callback(status);
		});
	}

	function getStatus(statusID, callback) {
		$.ajax({
			url: "status/" + statusID,
			type: 'GET',
			contentType: 'application/json',
			complete: function(xhr, textStatus) {
				callback(xhr);
			}
		});
	}

	function getStatusSince(timestamp, callback) {
		$.ajax({
			url: "status?since=" + timestamp,
			type: 'GET',
			contentType: 'application/json',
			complete: function(xhr, textStatus) {
				callback(xhr);
			}
		});
	}

	function getStatusesBefore(timestamp, callback) {
		$.ajax({
			url: "statuses?before=" + timestamp,
			type: 'GET',
			contentType: 'application/json',
			complete: function(xhr, textStatus) {
				callback(xhr);
			}
		});
	}

	function getStatusesSearch(search_term, callback)
	{
		$.ajax({
			url: "search/" + encodeURIComponent(search_term),
			type: 'GET',
			contentType: 'application/json',
			complete: function(xhr, textStatus) {
				callback(xhr);
			}
		});
	}

	return {
		postStatus: postStatus,
		postVote: postVote,

		getStatus: getStatus,
		getStatusRandom: getStatusRandom,
		getStatusSince: getStatusSince,

		getStatusesBefore: getStatusesBefore,
		getStatusesSearch:getStatusesSearch
	}
});