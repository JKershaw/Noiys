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

		$("#top-nav-tabs > li > a").click(function() {
			change_feed_type($(this).attr('data-feed'));
		});

		$('body').on('click', 'a.button-vote', function() {
			vote($(this).attr('data-id'));
		});

		$('body').on('click', 'a.button-reply', function() {
			reply($(this).attr('data-id'));
		});

		$('body').on('click', 'a.button-remove-my-status', function() {
			remove_my_status($(this).attr('data-id'));
		});

		$('body').on('click', 'a.button-star', function() {
			star($(this).attr('data-id'));
		});

		$('body').on('click', 'a.button-show-hidden-quote', function() {
			show_hidden_quote($(this).attr('data-id'),$(this).attr('data-wrapper'));
		});

		$('body').on('click', 'a.button-show-replies', function() {
			show_replies($(this).attr('data-id'),$(this).attr('data-responses-array').split(","));
		});

		$('body').on('click', 'a.button-search', function() {
			goto_search($(this).attr('data-search-term'));
		});




		random_status_timeout = setTimeout(get_and_show_random_status, 10);
		inititalise_my_stars();
		inititalise_my_statuses();
		select_initial_tab();
	});

});