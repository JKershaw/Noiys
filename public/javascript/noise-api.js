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
				if (xhr.status == 200) {
					callback(xhr.responseText);
				} else if (xhr.status == 400) {
					callback(false);
				} else  {
					_rollbar.push(xhr.status + " error: " + "status/" + timestamp);
					callback();
				}
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
				if (xhr.status == 200) {
					callback(true);
				} else {
					_rollbar.push(xhr.status + " error: " + "vote" + timestamp);
					callback();
				}
			}
		});
	}

	function getStatusRandom(callback) {
		$.ajax({
			url: "status",
			type: 'GET',
			contentType: 'application/json',
			complete: function(xhr, textStatus) {
				callback(JSON.parse(xhr.responseText));
			}
		});
	}

	function getStatus(statusID, callback) {
		$.ajax({
			url: "status/" + statusID,
			type: 'GET',
			contentType: 'application/json',
			complete: function(xhr, textStatus) {
				if (xhr.status == 200) {
					callback(JSON.parse(xhr.responseText));
				} else if (xhr.status == 404) {
					callback(false);
				} else {
					_rollbar.push(xhr.status + " error: " + "status/" + timestamp);
					callback();
				}
			}
		});
	}

	function getStatusSince(timestamp, callback) {
		$.ajax({
			url: "status?since=" + timestamp,
			type: 'GET',
			contentType: 'application/json',
			complete: function(xhr, textStatus) {
				if (xhr.status == 200) {
					callback(JSON.parse(xhr.responseText));
				} else if (xhr.status == 404) {
					callback(false);
				} else {
					_rollbar.push(xhr.status + " error: " + "status?since=" + timestamp);
					callback();
				}
			}
		});
	}

	function getStatusesFromIDs(IDs, callback) {
		var options = ["IDs=" + IDs.join(',')];
		getStatuses(options, callback);
	}

	function getRawStatusesFromIDs(IDs, callback) {
		var options = ["IDs=" + IDs.join(','), "raw=true"];
		getStatuses(options, callback);
	}

	function getStatusesLatest(callback) {
		var options = ["latest=true"];
		getStatuses(options, callback);
	}

	function getStatusesBefore(timestamp, callback) {
		var options = ["before=" + timestamp];
		getStatuses(options, callback);
	}

	function getStatusesHome(callback) {
		var options = ["home=true"];
		getStatuses(options, callback);
	}

	function getStatuses(options, callback) {

		var options_string = "";
		if (options && options.length>0){
			options_string = "?" + options.join('&');
		}

		var ajax_url = "statuses" + options_string;
		$.ajax({
			url: ajax_url,
			type: 'GET',
			contentType: 'application/json',
			complete: function(xhr, textStatus) {
				if (xhr.status == 200) {
					callback(JSON.parse(xhr.responseText));
				} else if (xhr.status == 404) {
					callback(false);
				} else {
					_rollbar.push(xhr.status + " error: " + ajax_url);
					callback();
				}
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
				if (xhr.status == 200) {
					callback(JSON.parse(xhr.responseText));
				} else if (xhr.status == 404) {
					callback(false);
				} else {
					_rollbar.push(xhr.status + " error: " + "search=" + search_term);
					callback();
				}
			}
		});
	}

	return {
		postStatus: postStatus,
		postVote: postVote,

		getStatus: getStatus,
		getStatusRandom: getStatusRandom,
		getStatusSince: getStatusSince,

		getStatusesHome: getStatusesHome,
		getStatusesFromIDs: getStatusesFromIDs,
		getStatusesLatest: getStatusesLatest,
		getStatusesBefore: getStatusesBefore,
		getStatusesSearch: getStatusesSearch,
		
		getRawStatusesFromIDs: getRawStatusesFromIDs
	}
});