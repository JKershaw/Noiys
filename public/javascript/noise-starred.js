define(['underscore', 'noise-api', 'noise-publish-status'], function(_, noiseApi, noisePublishStatus) {
	
	var my_stars = Array();
	
	function star(statusID) {
		console.debug("toggling Star");

		if (is_starred(statusID)) {
			$("#star-" + statusID).removeClass("glyphicon-star");
			$("#star-" + statusID).addClass("glyphicon-star-empty");
			remove_my_star(statusID)
		} else {
			$("#star-" + statusID).addClass("glyphicon-star");
			$("#star-" + statusID).removeClass("glyphicon-star-empty");
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
		console.debug("removeing star ", statusID);

		var index = my_stars.indexOf(statusID);
		if (index > -1) {
			my_stars.splice(index, 1);
		}
		perma_save_my_stars();
	}

	function inititalise_my_stars() {
		perma_load_my_stars();
	}

	function get_my_starred_statuses(callback) {

		var my_starred_statuses = Array();

		var finished = _.after(my_stars.length, function() {
			console.log("finished finished");
			callback(my_starred_statuses);
		});

		_.each(my_stars, function(statusID) {
			console.log("In the Each for ", statusID);
			(function(statusID) {
				noiseApi.getStatus(statusID, function(status) {
					if (status) {
						console.log("found ", statusID);
						my_starred_statuses.push(status);
					} else if (status === false) {
						console.log("removing ", statusID);
						remove_my_star(statusID);
					}

					finished();
				});
			})(statusID);
		});
	}
	
	return {
		star: star,
		is_starred: is_starred,
		inititalise_my_stars: inititalise_my_stars,
		get_my_starred_statuses: get_my_starred_statuses
	}
});