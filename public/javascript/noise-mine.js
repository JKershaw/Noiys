define(['noise-api', 'noise-publish-status'], function(noiseApi, noisePublishStatus) {
	
	var my_statuses = Array();

	function save_my_status(statusID) {
		console.debug("saving Status: ", statusID);
		console.debug("current: ", my_statuses);
		my_statuses.push(statusID);
		console.debug("new: ", my_statuses);
		perma_save_my_statuses();
	}

	function perma_save_my_statuses() {
		console.debug("perma save");
		localStorage.my_statuses = JSON.stringify(my_statuses);
		console.debug(my_statuses);
	}

	function perma_load_my_statuses() {
		console.debug("perma load my statuses");
		if (localStorage.my_statuses) {
			my_statuses = JSON.parse(localStorage.my_statuses);
		}
		console.debug(my_statuses);
	}

	function remove_my_status(statusID) {
		console.debug("Removing status ", statusID);

		var index = my_statuses.indexOf(statusID);
		if (index > -1) {
			my_statuses.splice(index, 1);
		}

		perma_save_my_statuses();

		$("#me_statuses #" + statusID).fadeOut("fast", function() {
			$("#me_statuses #" + statusID).remove();
		});
	}

	function is_my_status(statusID) {
		var index = my_statuses.indexOf(statusID);
		if (index > -1) {
			return true;
		} else {
			return false;
		}
	}

	function inititalise_my_statuses() {
		perma_load_my_statuses();
	}
	
	function get_my_statuses(callback) {

		var my_statuses_array = Array();

		var finished = _.after(my_statuses.length, function() {
			callback(my_statuses_array);
		});

		_.each(my_statuses, function(statusID) {
			(function(statusID) {
				noiseApi.getStatus(statusID, function(status) {
					if (status) {
						my_statuses_array.push(status);
					} else if (status === false) {
						remove_my_status(statusID);
					}

					finished();
				});
			})(statusID);
		});
	}
	return {
		save_my_status: save_my_status,
		remove_my_status: remove_my_status,
		inititalise_my_statuses: inititalise_my_statuses,
		get_my_statuses: get_my_statuses
	}
});