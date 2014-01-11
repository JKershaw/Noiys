define(['noise-api', 'noise-status'], function(noiysApi, noiysStatus) {

	var manual_pause = false,
		auto_pause = false,
		current_feed_type,
		init_home = false;

	function toggle_manual_pause() {
		manual_pause = !manual_pause;

		if (manual_pause === false) {
			$('#pause_feed').html("<span class=\"glyphicon glyphicon-pause\"></span>Pause Feed");
		} else {
			$('#pause_feed').html("<span class=\"glyphicon glyphicon-play\"></span> Un-pause Feed");
		}
	}

	function set_auto_pause(new_state) {
		auto_pause = new_state;
	}

	function is_manually_paused() {
		return manual_pause;
	}

	function is_auto_paused() {
		return auto_pause;
	}

	function is_paused() {
		return (auto_pause || manual_pause);
	}

	function change(selected_feed_type) {

		current_feed_type = selected_feed_type;

		clear_random_feed_timeout();
		clear_chronological_feed_timeout()
		
		if (selected_feed_type == "random") {
			get_and_show_random_status();
		} else if (selected_feed_type == "home") {
			initialise_home();
		} else if (selected_feed_type == "chronological") {
			intitialise_chronological();
			get_and_show_chronological_status();
		}
	}

	var random_status_timeout;

	function get_and_show_random_status() {

		if (!is_paused() && (current_feed_type == 'random')) {
		
			noiysApi.getStatusRandom(function(status) {
				noiysStatus.publish(status, "#random_statuses", true);
			});
			random_status_timeout = setTimeout(get_and_show_random_status, 6000);
		}
		else {
			random_status_timeout = setTimeout(get_and_show_random_status, 1000);
		}

	}

	function clear_random_feed_timeout(){
		clearTimeout(random_status_timeout);
	}

	var init_chronological = false;
	var newest_status_timestamp = 0;
	var oldest_status_timestamp = Number.MAX_VALUE;
	var chronological_status_timeout;

	function clear_chronological_feed_timeout(){
		clearTimeout(chronological_status_timeout);
	}

	function intitialise_chronological() {
		if (!init_chronological) {
			init_chronological = true;
			console.debug("intitialise_chronological");
			$('#main_info').show().html("Just loading the latest notes now.");

			noiysApi.getStatusesLatest(function(statuses){
				$('#main_info').hide();
				for (var i = 0; i < statuses.length; i++) {

					if (statuses[i].timestamp > newest_status_timestamp) {
						newest_status_timestamp = statuses[i].timestamp;
					}
					if (statuses[i].timestamp < oldest_status_timestamp) {
						oldest_status_timestamp = statuses[i].timestamp;
					}

					noiysStatus.publish(statuses[i], "#chronological_statuses", true);
				}


				get_and_show_chronological_status();
			});
		}
	}

	function get_and_show_chronological_status() {
		console.debug("get_and_show_chronological_status called");
		clear_chronological_feed_timeout();

		if (!is_paused() && (newest_status_timestamp > 0) && (current_feed_type == 'chronological')) {
			
			noiysApi.getStatusSince(newest_status_timestamp, function(status) {
				if (status) {
					newest_status_timestamp = status.timestamp;
					noiysStatus.publish(status, "#chronological_statuses", true);

					chronological_status_timeout = setTimeout(function() {
						get_and_show_chronological_status()
					}, 5000);
				} else if (status === false) {
					console.debug("No new statuses found");
					chronological_status_timeout = setTimeout(function() {
						get_and_show_chronological_status()
					}, 10000);
				}
			});

		} else {
			chronological_status_timeout = setTimeout(function() {
				get_and_show_chronological_status()
			}, 5000);
		}
	}

	function get_and_show_older_chronological_statuses(callback) {
		console.debug("get_and_show_older_chronological_statuses called");

		if (oldest_status_timestamp < Number.MAX_VALUE) {

			noiysApi.getStatusesBefore(oldest_status_timestamp, function(statuses) {
				if (statuses) {
					for (var i = statuses.length - 1; i >= 0; i--) {
						if (statuses[i].timestamp < oldest_status_timestamp) {
							oldest_status_timestamp = statuses[i].timestamp;
						}

						noiysStatus.publish(statuses[i], "#chronological_statuses", false);
					}
				} else if (statuses === false) {
					console.debug("No older statuses found");
				}
				callback();
			});
		}
	}


	function get_and_show_search_statuses(search_term, callback) {
		console.debug("get_and_show_search_statuses called");

		noiysApi.getStatusesSearch(search_term, function(statuses) {

			if (statuses) {
				$('#search_statuses_result').html('');

				for (var i = 0; i < statuses.length; i++) {
					noiysStatus.publish(statuses[i], "#search_statuses_result", true);
				}

				$('#search_statuses_result>div').sort(function(a, b) {
					return $(a).attr("timestamp") < $(b).attr("timestamp") ? 1 : -1;
				}).appendTo("#search_statuses_result");

			} else if (statuses === false){
				$('#search_statuses_result').html('No statuses found.');
			} else {
				$('#search_statuses_result').html('Err, error?');
			}
			
			callback();
		});
	}

	function initialise_home() {
		if (!init_home) {
			init_home = true;
			console.debug("intitialise_home");

			$('#main_info').show().html("Just loading your home feed now.");

			noiysApi.getStatusesHome(function(statuses){
				for (var i = 0; i < statuses.length; i++) {
					noiysStatus.publish(statuses[i], "#home_statuses", false);
				}

				$('#main_info').hide();
			});
		}
	}


	return {
		toggle_manual_pause: toggle_manual_pause,
		set_auto_pause: set_auto_pause,
		is_manually_paused: is_manually_paused,
		is_auto_paused: is_auto_paused,
		is_paused: is_paused,

		get_and_show_random_status: get_and_show_random_status,
		clear_random_feed_timeout: clear_random_feed_timeout,

		intitialise_chronological: intitialise_chronological,
		get_and_show_chronological_status: get_and_show_chronological_status,
		clear_chronological_feed_timeout: clear_chronological_feed_timeout,
		get_and_show_older_chronological_statuses: get_and_show_older_chronological_statuses,

		get_and_show_search_statuses: get_and_show_search_statuses,

		change: change
	}
});