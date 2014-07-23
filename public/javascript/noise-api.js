define(['jquery', 'noiys-ui-error', 'noiys-vote-count'], function($, noiysUiError, noiysVoteCount) {

	function postStatus(statusText, callback) {
		$.ajax({
			url: '/status',
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({
				text: statusText
			}),
			complete: function(xhr, status) {
				noiysUiError.hide_error();
				if (xhr.status == 200) {
					callback(xhr.responseText);
				} else if (xhr.status == 400) {
					callback(false);
				} else  {
					noiysUiError.show_error();
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
				noiysUiError.hide_error();
				if (xhr.status == 200) {
					callback(true);
				} else {
					noiysUiError.show_error();
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
			//contentType: 'application/json',
			complete: function(xhr, textStatus) {
				noiysUiError.hide_error();
				var status = JSON.parse(xhr.responseText);
				noiysVoteCount.set_count_from_status(status);
				callback(status);
			}
		});
	}

	function getStatus(statusID, callback) {
		$.ajax({
			url: "status/" + statusID,
			type: 'GET',
			//contentType: 'application/json',
			complete: function(xhr, textStatus) {
				noiysUiError.hide_error();
				if (xhr.status == 200) {
					var status = JSON.parse(xhr.responseText);
					noiysVoteCount.set_count_from_status(status);
					callback(status);
				} else if (xhr.status == 404) {
					callback(false);
				} else {
					noiysUiError.show_error();
					_rollbar.push(xhr.status + " error: " + "status/" + statusID);
					callback();
				}
			}
		});
	}

	function getStatusAsReply(statusID, callback) {
		$.ajax({
			url: "status/" + statusID + "?reply=true",
			type: 'GET',
			//contentType: 'application/json',
			complete: function(xhr, textStatus) {
				noiysUiError.hide_error();
				if (xhr.status == 200) {
					var status = JSON.parse(xhr.responseText);
					noiysVoteCount.set_count_from_status(status);
					callback(status);
				} else if (xhr.status == 404) {
					callback(false);
				} else {
					noiysUiError.show_error();
					_rollbar.push(xhr.status + " error: " + "status/" + statusID);
					callback();
				}
			}
		});
	}

	function getStatusSince(timestamp, callback) {
		$.ajax({
			url: "status?since=" + timestamp,
			type: 'GET',
			//contentType: 'application/json',
			complete: function(xhr, textStatus) {
				noiysUiError.hide_error();
				if (xhr.status == 200) {
					var status = JSON.parse(xhr.responseText);
					noiysVoteCount.set_count_from_status(status);
					callback(status);
				} else if (xhr.status == 404) {
					callback(false);
				} else {
					noiysUiError.show_error();
					_rollbar.push(xhr.status + " error: " + "status?since=" + timestamp);
					callback();
				}
			}
		});
	}


	function getStatusAsParent(statusID, callback) {
		$.ajax({
			url: "status/" + statusID + "?parent=true",
			type: 'GET',
			//contentType: 'application/json',
			complete: function(xhr, textStatus) {
				noiysUiError.hide_error();
				if (xhr.status == 200) {
					var status = JSON.parse(xhr.responseText);
					noiysVoteCount.set_count_from_status(status);
					callback(status);
				} else if (xhr.status == 404) {
					callback(false);
				} else {
					noiysUiError.show_error();
					_rollbar.push(xhr.status + " error: " + "status/" + statusID);
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
		var options = [];
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
			//contentType: 'application/json',
			complete: function(xhr, textStatus) {
				noiysUiError.hide_error();
				if (xhr.status == 200) {
					var statuses = JSON.parse(xhr.responseText);
					noiysVoteCount.set_count_from_statuses(statuses);
					callback(statuses);
				} else if (xhr.status == 404) {
					callback(false);
				} else {
					noiysUiError.show_error();
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
			//contentType: 'application/json',
			complete: function(xhr, textStatus) {
				noiysUiError.hide_error();
				if (xhr.status == 200) {
					var statuses = JSON.parse(xhr.responseText);
					noiysVoteCount.set_count_from_statuses(statuses);
					callback(statuses);
				} else if (xhr.status == 404) {
					callback(false);
				} else {
					noiysUiError.show_error();
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
		getStatusAsReply: getStatusAsReply,
		getStatusAsParent: getStatusAsParent,

		getStatusesHome: getStatusesHome,
		getStatusesFromIDs: getStatusesFromIDs,
		getStatusesLatest: getStatusesLatest,
		getStatusesBefore: getStatusesBefore,
		getStatusesSearch: getStatusesSearch,
		
		getRawStatusesFromIDs: getRawStatusesFromIDs
	}
});