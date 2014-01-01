define(['jquery', 'underscore', 'noise-api', 'noise-mine', 'noise-starred', 'noise-status', 'timeago', 'bootstrap'], function($, _, noiseApi, noiseMine, noiseStarred, noiseStatus) {

	var paused = false;
	var feed_type = "random";
	var random_status_timeout, chronological_status_timeout;
	var newest_status_timestamp = 0;
	var oldest_status_timestamp = Number.MAX_VALUE;
	var init_chronological = false;

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

		$("#button-go-up").click(function() {
			$('html, body').animate({
				scrollTop: 0
			}, 'fast');
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
			noiseMine.remove_my_status($(this).attr('data-id'));
		});

		$('body').on('click', 'a.button-star', function() {
			noiseStarred.star($(this).attr('data-id'));
			refresh_my_stars();
		});

		$('body').on('click', 'a.button-show-hidden-quote', function() {
			show_hidden_quote($(this).attr('data-id'), $(this).attr('data-wrapper'));
		});

		$('body').on('click', 'a.button-show-replies', function() {
			show_replies($(this).attr('data-id'), $(this).attr('data-wrapper'), $(this).attr('data-responses-array').split(","));
		});

		$('body').on('click', 'a.button-search', function() {
			goto_search($(this).attr('data-search-term'));
		});

		select_initial_tab();

		noiseStarred.inititalise_my_stars();
		refresh_my_stars();

		noiseMine.inititalise_my_statuses();
		refresh_my_statuses();

		hide_loding_page();

		random_status_timeout = setTimeout(get_and_show_random_status, 10);
	});
	
	function hide_loding_page() {
		$('#loading-container').hide();
		$('#main-container').show();
	}

	function toggle_pause() {
		if (paused === true) {
			paused = false;
			$('#pause_feed').text("Pause Feed");
		} else {
			paused = true;
			$('#pause_feed').text("Un-pause Feed");
		}
	}

	function post_status() {
		$('#post_status').prop('disabled', true);
		$('#post_status').text("Posting ...");

		noiseApi.postStatus($('#statusText').val(), function(posted) {
			
			$("#main_error").hide();
			
			if (posted) {
				$('#post_status').text("Posted!");
				$('#statusText').val("");

				noiseMine.save_my_status(posted);
				refresh_my_statuses();
				get_and_show_chronological_status(5);

			} else if (posted === false) {
				$('#post_status').text("Not Posted ...");
				$('#post_status').addClass("btn-warning");

			} else {
				$("#main_error").show();
			}

			$('#post_status').prop('disabled', false);
				setTimeout(set_posted_button, 3000);
		});
	}

	function set_posted_button() {
		$('#post_status').text("Post Status");
		$('#post_status').removeClass("btn-warning");
	}

	function change_feed_type(selected_feed_type) {
		$('.nav-tabs li').removeClass("active");
		$('.statuses_wrap').hide();

		clearTimeout(random_status_timeout);
		clearTimeout(chronological_status_timeout);

		feed_type = selected_feed_type;
		localStorage.current_tab = feed_type;

		$('.nav li .extended').hide();
		$('#tab-' + feed_type + " .extended").show();
		$('#tab-' + feed_type).addClass("active");
		$('#' + feed_type + '_statuses').show();
		$('#pause_feed').hide();

		if (feed_type == "random") {
			$('#pause_feed').show();
			random_status_timeout = setTimeout(get_and_show_random_status, 1000);
		} else if (feed_type == "chronological") {
			$('#pause_feed').show();
			intitialise_chronological();
			get_and_show_chronological_status(6);
		}
	}


	function select_initial_tab() {
		if (localStorage.current_tab) {
			change_feed_type(localStorage.current_tab)
		} else {
			change_feed_type("random");
		}
	}

	function get_and_show_random_status() {

		if ((paused === false) && (feed_type == 'random')) {
			noiseApi.getStatusRandom(function(status) {
				noiseStatus.publish(status, "#random_statuses", true);
				$("#main_error").hide();
			});
		}

		random_status_timeout = setTimeout(get_and_show_random_status, 6000);
	}

	function get_and_show_search_statuses(search_term, callback) {
		console.debug("get_and_show_search_statuses called");

		noiseApi.getStatusesSearch(search_term, function(statuses) {
		
			$("#main_error").hide();

			if (statuses) {
				$('#search_statuses_result').html('');

				for (var i = 0; i < statuses.length; i++) {
					noiseStatus.publish(statuses[i], "#search_statuses_result", true);
				}

				$('#search_statuses_result>div').sort(function(a, b) {
					return $(a).attr("timestamp") < $(b).attr("timestamp") ? 1 : -1;
				}).appendTo("#search_statuses_result");

			} else if (statuses === false){
				$('#search_statuses_result').html('No statuses found.');
			} else {
				$('#search_statuses_result').html('Err, error?');
				$("#main_error").show();
			}
			
			callback();
		});
	}

	function load_older_chronological_statuses_clicked() {
		$("#load_older_statuses").text("Loading...");
		$('#load_older_statuses').prop('disabled', true);
		get_and_show_older_chronological_statuses(function() {
			$("#load_older_statuses").text("Load older statuses");
			$('#load_older_statuses').prop('disabled', false);
		});
	}

	function get_and_show_chronological_status(calling_point) {
		console.debug("get_and_show_chronological_status called from ", calling_point);

		if ((paused === false) && (newest_status_timestamp > 0) && (feed_type == 'chronological')) {
			
			noiseApi.getStatusSince(newest_status_timestamp, function(status) {
				if (status) {
					newest_status_timestamp = status.timestamp;
					noiseStatus.publish(status, "#chronological_statuses", true);

					chronological_status_timeout = setTimeout(function() {
						get_and_show_chronological_status(1)
					}, 5000);
				} else if (status === false) {
					console.debug("No new statuses found");
					chronological_status_timeout = setTimeout(function() {
						get_and_show_chronological_status(2)
					}, 10000);
				} else {
					$("#main_error").show();
					_rollbar.push(xhr.status + " error: " + "status?since=" + newest_status_timestamp);
				}
			});

		} else {
			chronological_status_timeout = setTimeout(function() {
				get_and_show_chronological_status(3)
			}, 5000);
		}
	}

	function get_and_show_older_chronological_statuses(callback) {
		console.debug("get_and_show_older_chronological_statuses called");

		if ((oldest_status_timestamp < Number.MAX_VALUE) && (feed_type == 'chronological')) {

			noiseApi.getStatusesBefore(oldest_status_timestamp, function(statuses) {
				
				$("#main_error").hide();

				if (statuses) {
					console.debug(statuses);
					for (var i = statuses.length - 1; i >= 0; i--) {
						if (statuses[i].timestamp < oldest_status_timestamp) {
							oldest_status_timestamp = statuses[i].timestamp;
						}

						noiseStatus.publish(statuses[i], "#chronological_statuses", false);
					}
				} else if (statuses === false) {
					console.debug("No older statuses found");
				} else {
					$("#main_error").show();
				}
				callback();
			});
		}
	}

	function intitialise_chronological() {
		if (!init_chronological) {
			init_chronological = true;
			console.debug("intitialise_chronological");
			$('#main_info').show().html("Just loading the latest statuses now.");
			$.get("statuses", function(statuses) {
				for (var i = 0; i < statuses.length; i++) {

					if (statuses[i].timestamp > newest_status_timestamp) {
						newest_status_timestamp = statuses[i].timestamp;
					}
					if (statuses[i].timestamp < oldest_status_timestamp) {
						oldest_status_timestamp = statuses[i].timestamp;
					}

					noiseStatus.publish(statuses[i], "#chronological_statuses", true);
				}

				$('#main_info').hide();
				$("#main_error").hide();

				get_and_show_chronological_status(4);
			});
		}
	}

	function run_search() {
		$("#search_statuses_button").text("Searching...");
		$('#search_statuses_button').prop('disabled', true);
		get_and_show_search_statuses($('#search_statuses_text').val(), function() {
			$("#search_statuses_button").text("Search");
			$('#search_statuses_button').prop('disabled', false);
		});
	}

	function show_hidden_quote(statusID, wrapper) {
		$(wrapper + " #" + statusID + " * .show_quote_link").remove();
		var quote_to_hide_selector = $(wrapper + " #" + statusID + " > div.panel-body > div.panel > div.panel-body > div.panel > div.panel-body > div.panel");
		quote_to_hide_selector.fadeIn();
	}

	function goto_search(search_term) {
		change_feed_type("search");
		$('#search_statuses_text').val(search_term);
		run_search();
	}

	function vote(id) {
		$("#" + id + " .votes").text(parseInt($("#" + id + " .votes").text()) + 1);
		$("#" + id + " .votes").css("color", "green");

		noiseApi.postVote(id, function(posted){});
	}

	function reply(id) {
		var newText = "@" + id + "\n" + $('#statusText').val();
		$('#statusText').val(newText).focus();
		$('html, body').animate({
			scrollTop: 0
		}, 'fast');
	}

	function show_replies(status_id, wrapper, replies_ids) {
		for (var i = 0; i < replies_ids.length; i++) {
			noiseApi.getStatus(replies_ids[i], function(status) {
				noiseStatus.publish(status, wrapper + " #" + status_id + " .responses", true);
			});
		}
	}

	function refresh_my_stars() {

		noiseStarred.get_my_starred_statuses(function(statuses){
			_.each(statuses, function(status) {
				noiseStatus.publish(status, "#stars_statuses", true);
			});

			$('#stars_statuses>div').sort(function(a, b) {
				return $(a).attr("timestamp") < $(b).attr("timestamp") ? 1 : -1;
			}).appendTo("#stars_statuses");
		});
	}

	function refresh_my_statuses() {

		noiseMine.get_my_statuses(function(statuses){
			_.each(statuses, function(status) {
				noiseStatus.publish(status, "#me_statuses", true);
			});

			$('#me_statuses>div').sort(function(a, b) {
				return $(a).attr("timestamp") < $(b).attr("timestamp") ? 1 : -1;
			}).appendTo("#me_statuses");
		});
	}

});