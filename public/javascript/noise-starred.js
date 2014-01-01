define(['underscore', 'noise-api', 'noise-publish-status'], function(_, noiseApi, noisePublishStatus) {
	
	var my_stars = Array();
	
	function star(statusID) {
		console.debug("toggling Star");

		if (is_starred(statusID)) {
			$(".star-" + statusID).removeClass("glyphicon-star");
			$(".star-" + statusID).addClass("glyphicon-star-empty");
			remove_my_star(statusID)
		} else {
			$(".star-" + statusID).addClass("glyphicon-star");
			$(".star-" + statusID).removeClass("glyphicon-star-empty");
			my_stars.push(statusID);
			perma_save_my_stars();
		}
	}

	function is_starred(statusID) {
		var index = my_stars.indexOf(statusID);
		if (index > -1) {
			return true;
		} else {
			return false;
		}
	}

	function perma_save_my_stars() {
		console.debug("perma save stars");
		localStorage.my_stars = JSON.stringify(my_stars);
		console.debug(my_stars);
	}

	function perma_load_my_stars() {
		console.debug("perma load stars");
		if (localStorage.my_stars) {
			my_stars = JSON.parse(localStorage.my_stars);
		}
		console.debug(my_stars);
	}

	function remove_my_star(statusID) {
		console.debug("removing star ", statusID);

		var index = my_stars.indexOf(statusID);
		if (index > -1) {
			my_stars.splice(index, 1);
		}

		perma_save_my_stars();

		$("#stars_statuses #" + statusID).fadeOut("fast", function() {
			$("#stars_statuses #" + statusID).remove();
		});
	}

	function inititalise_my_stars() {
		perma_load_my_stars();
	}

	function get_my_starred_statuses(callback) {

		if (my_stars.length > 0)
		{
			noiseApi.getStatuses(my_stars, function(statuses){
				console.log("got statuses");

				if (statuses) {
					var found_statusIDs_array = Array();

					for(var i=0; i < statuses.length; i++)
					{
						found_statusIDs_array.push(statuses[i].id);	
					}

					for(var i=0; i < my_stars.length; i++)
					{
						var index = found_statusIDs_array.indexOf(my_stars[i]);
						if (index <= -1) {
							console.log("removing star");
							remove_my_star(my_stars[i]);
						} 			
					}
					
				} else if(statuses === false) {
					for(var i=0; i < my_stars.length; i++)
					{
						remove_my_star(my_stars[i]);			
					}
				}

				callback(statuses);
			});
		} else {
			callback([]);
		}
	}
	
	return {
		star: star,
		is_starred: is_starred,
		inititalise_my_stars: inititalise_my_stars,
		get_my_starred_statuses: get_my_starred_statuses
	}
});