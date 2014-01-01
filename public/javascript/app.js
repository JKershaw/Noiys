define(['jquery', 'noise-api', 'timeago', 'bootstrap'], function($, noiseApi) {

	var paused = false;
	var feed_type = "random";
	var random_status_timeout, chronological_status_timeout;
	var newest_status_timestamp = 0;
	var oldest_status_timestamp = Number.MAX_VALUE;
	var init_chronological = false;
	var my_statuses = Array();
	var my_stars = Array();

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
			remove_my_status($(this).attr('data-id'));
		});

		$('body').on('click', 'a.button-star', function() {
			star($(this).attr('data-id'));
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

		random_status_timeout = setTimeout(get_and_show_random_status, 10);
		inititalise_my_stars();
		inititalise_my_statuses();
	});

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

				save_my_status(posted);
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

		if (paused === false) {
			noiseApi.getStatusRandom(function(status) {
				publish_status(status, "#random_statuses", true);
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
					publish_status(statuses[i], "#search_statuses_result", true);
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
					publish_status(status, "#chronological_statuses", true);

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

						publish_status(statuses[i], "#chronological_statuses", false);
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

					publish_status(statuses[i], "#chronological_statuses", true);
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
				publish_status(status, wrapper + " #" + status_id + " .responses", true);
			});
		}
	}


	function publish_status(status, wrapper, prepend) {

		$(wrapper + " #" + status.id).remove();

		if (prepend) {
			$(wrapper).prepend(generate_status_html(status, wrapper));
			$(wrapper + " div").first().hide().fadeIn();
		} else {
			console.debug("appending", status.id);
			$(wrapper + " .final").before(generate_status_html(status, wrapper));
			$(wrapper + " > div").show();
		}

		var quote_to_hide_selector = $(wrapper + " #" + status.id + " > div.panel-body > div.panel > div.panel-body > div.panel > div.panel-body > div.panel");

		if (quote_to_hide_selector) {
			quote_to_hide_selector.after("<div class=\"show_quote_link panel panel-default status_panel\"><div class=\"panel-body\"><a style=\"cursor:pointer\" class=\"button-show-hidden-quote\" data-id=\"" + status.id + "\" data-wrapper = \"" + wrapper + "\">Show quote</a></div></div>");
			quote_to_hide_selector.hide();
		}

		$("span.timeago").timeago();

	}

	function generate_status_html(status, wrapper) {

		var response_string = "";
		if (status.responses) {
			if (status.responses.length == 1) {
				response_string = "1 reply";
			} else {
				response_string = String(status.responses.length) + " replies";
			}

			responses_array_string = status.responses.join(",");

			response_string = "<a style=\"cursor:pointer\" class=\"button-show-replies\" data-wrapper=\"" + wrapper + "\" data-id=\"" + status.id + "\" data-responses-array=\"" + responses_array_string + "\">" + response_string + "</a>";

		}

		var hashtag_regex = /&#35;\w*/g

		status.text = status.text.replace(hashtag_regex, function(match) {
			return "<a style=\"cursor:pointer;\" class=\"button-search\" data-search-term=\"" + match + "\">" + match + "</a>";
		});

		var text_string = "<p>" + status.text + " </p>";

		var votes_string = "<span style=\"font-weight:bold;\" class=\"votes\">" + status.votes + "</span>";

		var verb_string = "<a style=\"cursor:pointer;\" class=\"button-vote\" data-id='" + status.id + "' >VERB</a>";

		var reply_string = "<a style=\"cursor:pointer\" class=\"button-reply\" data-id='" + status.id + "'><span class=\"glyphicon glyphicon-retweet\"></a>";

		var trash_string = "";

		if (wrapper == "#me_statuses") {
			trash_string = "<a style=\"cursor:pointer; float:right;\" class=\"button-remove-my-status\" data-id='" + status.id + "'><span class=\"glyphicon glyphicon-remove\"></span></a>";
		}

		if (is_starred(status.id)) {
			var star_string = "<a style=\"cursor:pointer\" class=\"button-star\" data-id='" + status.id + "'><span id=\"star-" + status.id + "\"class=\"glyphicon glyphicon-star\"></a>";
		} else {
			var star_string = "<a style=\"cursor:pointer\" class=\"button-star\" data-id='" + status.id + "'><span id=\"star-" + status.id + "\"class=\"glyphicon glyphicon-star-empty\"></a>";
		}


		var timeago_string = "<small><span style=\"float:right;color:#888;\">posted <span class=\"timeago\" title=\"" + status.ISO8601timestamp + "\"></span></span></small>";


		return "<div style=\"display:none\" class=\"panel panel-default status_panel\" timestamp=\"" + status.timestamp + "\" id=\"" + status.id + "\"><div class=\"panel-body\">" + trash_string + "" + text_string + "<div class=\"row\"><div class=\"col-md-4\"><small>" + votes_string + "&nbsp;&nbsp;&nbsp;" + verb_string + "&nbsp;&nbsp;&nbsp;" + reply_string + "&nbsp;&nbsp;&nbsp;" + star_string + "</small></div><div class=\"col-md-4\" style=\"text-align:center\"><small>" + response_string + "</small></div><div class=\"col-md-4\">" + timeago_string + "</div></div><div class=\"responses\"></div></div>";
	}

	function save_my_status(statusID) {
		console.debug("saving Status: ", statusID);
		console.debug("current: ", my_statuses);
		my_statuses.push(statusID);
		console.debug("new: ", my_statuses);
		perma_save_my_statuses();
		refresh_my_statuses();
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


	function refresh_my_statuses() {
		console.debug("Refreshing my statuses");

		for (var i = 0; i < my_statuses.length; i++) {
			(function(i) {

				var statusID = my_statuses[i];

				noiseApi.getStatus(statusID, function(status) {
					if (status === false) {
						$("#main_error").hide();
						console.debug("Status not found: ", statusID);
						remove_my_status(statusID);

					} else if (status) {
						$("#main_error").hide();
						console.log("Status found: ", status);
						publish_status(status, "#me_statuses", true);

						// sort the page
						$('#me_statuses>div').sort(function(a, b) {
							return $(a).attr("timestamp") < $(b).attr("timestamp") ? 1 : -1;
						}).appendTo("#me_statuses");

					} else {
						$("#main_error").show();
					}
				});

			})(i);
		}

		console.debug(my_statuses);
	}

	function inititalise_my_statuses() {
		perma_load_my_statuses();
		refresh_my_statuses();
	}

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
		refresh_my_stars();
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

	function refresh_my_stars() {
		console.debug("refresh");
		$("#stars_statuses").html("");
		for (var i = 0; i < my_stars.length; i++) {
			(function(i) {
				var statusID = my_stars[i];

				noiseApi.getStatus(statusID, function(status) {
					if (status) {
						$("#main_error").hide();
						console.log("Status found");
						publish_status(status, "#stars_statuses", true);

						$('#stars_statuses>div').sort(function(a, b) {
							return $(a).attr("timestamp") < $(b).attr("timestamp") ? 1 : -1;
						}).appendTo("#stars_statuses");
					} else if (status === false) {
						console.debug("Status not found: ", statusID);
						remove_my_star(statusID);
					} else {
						$("#main_error").show();
					}
				});
			})(i);
		}
	}

	function inititalise_my_stars() {
		perma_load_my_stars();
		refresh_my_stars();
	}
});