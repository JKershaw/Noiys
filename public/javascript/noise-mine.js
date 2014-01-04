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

		if (my_statuses.length > 0)
		{
			noiseApi.getStatusesFromIDs(my_statuses, function(statuses){
				console.log("got statuses");

				if (statuses) {
					var found_statusIDs_array = Array();

					for(var i=0; i < statuses.length; i++)
					{
						found_statusIDs_array.push(statuses[i].id);	
					}

					for(var i=0; i < my_statuses.length; i++)
					{
						var index = found_statusIDs_array.indexOf(my_statuses[i]);
						if (index <= -1) {
							remove_my_status(my_statuses[i]);
						} 			
					}
					
				} else if(statuses === false) {
					for(var i=0; i < my_statuses.length; i++)
					{
						remove_my_status(my_statuses[i]);			
					}
				}

				callback(statuses);
			});
		} else {
			callback([]);
		}
	
	}
	
	return {
		save_my_status: save_my_status,
		remove_my_status: remove_my_status,
		inititalise_my_statuses: inititalise_my_statuses,
		get_my_statuses: get_my_statuses
	}
});