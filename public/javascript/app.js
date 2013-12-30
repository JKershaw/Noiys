define(['jquery', 'timeago', 'bootstrap'], function($) {
	
	$(document).ready(function() {
		$("#post_status").click(function() {
			post_status();
		});

		$("#pause_feed").click(function() {
			toggle_pause();
		});

		$("#load_older_statuses").click(function() {
			load_older_chronological_statuses_clicked();
		});

		$("#search_statuses_button").click(function() {
			run_search();
		});

		$("#search_statuses_text").keyup(function(event) {
			if (event.keyCode == 13) {
				run_search();
			}
		});

		random_status_timeout = setTimeout(get_and_show_random_status, 10);
		inititalise_my_stars();
		inititalise_my_statuses();
		select_initial_tab();
	});

});