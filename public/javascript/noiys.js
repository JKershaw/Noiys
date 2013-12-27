	var paused = false;
			var feed_type = "random";
			var random_status_timeout, chronological_status_timeout;
			var most_recent_status_timestamp = 0;
			var init_chronological = false;

			$(document).ready(function() {
				random_status_timeout = setTimeout(get_and_show_random_status, 10);
			});

			function get_and_show_random_status() {

				if (paused === false) {
					$.get("status", function(status) {
						publish_status(status, "#random_statuses");
						$("#main_error").hide();
					});
				}

				random_status_timeout = setTimeout(get_and_show_random_status, 6000);

			}

			function get_and_show_chronological_status() {
				console.debug("get_and_show_chronological_status called");

				if ((paused === false) && (most_recent_status_timestamp > 0) && (feed_type == 'chronological')) {

					$.ajax({
						url: "status?since=" + most_recent_status_timestamp,
						type: 'GET',
						contentType: 'application/json',
						complete: function(xhr, textStatus) {
							if (xhr.status == 503) {
								$("#main_error").show();
								_rollbar.push("503 error: " + "status?since=" + most_recent_status_timestamp);
							} else {
								$("#main_error").hide();
							}
						}
					}).done(function(status) {
						most_recent_status_timestamp = status.timestamp;
						console.debug("Finished!");
						publish_status(status, "#chronological_statuses");

						chronological_status_timeout = setTimeout(get_and_show_chronological_status, 5000);
					}).fail(function() {
						console.debug("No new statuses found");
						chronological_status_timeout = setTimeout(get_and_show_chronological_status, 10000);
					}).always(function() {

						console.log("Always");
					});

				} else {
					chronological_status_timeout = setTimeout(get_and_show_chronological_status, 5000);
				}
			}

			function intitialise_chronological() {
				if (!init_chronological) {
					init_chronological = true;
					console.debug("intitialise_chronological");
					$('#main_info').show().html("Just loading the latest statuses now.");
					$.get("statuses", function(statuses) {
						for (var i = 0; i < statuses.length; i++) {

							if (statuses[i].timestamp > most_recent_status_timestamp) {
								most_recent_status_timestamp = statuses[i].timestamp;
							}

							publish_status(statuses[i], "#chronological_statuses");
						}

						$('#main_info').hide();
						$("#main_error").hide();

						get_and_show_chronological_status();
					});
				}
			}

			$("#post_status").click(function() {
				$('#post_status').prop('disabled', true);
				$('#post_status').text("Posting ...");

				$.ajax({
					url: '/status',
					type: 'POST',
					contentType: 'application/json',
					data: JSON.stringify({
						text: $('#statusText').val()
					}),
					complete: function(xhr, textStatus) {
						if (xhr.status == 503) {
							_rollbar.push("503 error saving status");
							$("#main_error").show();
						} else {
							$("#main_error").hide();
						}
					}
				}).done(function(data) {
					$('#post_status').prop('disabled', false);
					$('#post_status').text("Posted!");
					$('#statusText').val("");

					setTimeout(set_posted_button, 3000);
				});
			});

			$("#pause_feed").click(function() {
				if (paused === true) {
					paused = false;
					$('#pause_feed').text("Pause Feed");
				} else {
					paused = true;
					$('#pause_feed').text("Un-pause Feed");
				}
			});

			$("input:radio[name=feed_type]").change(function() {
				change_feed_type($('input:radio[name=feed_type]:checked').val());
			});

			function change_feed_type(selected_feed_type) {
				$('.nav-tabs li').removeClass("active");
				$('.statuses_wrap').hide();

				if (selected_feed_type == "feed_random") {
					$('#tab-random').addClass("active");
					$('#random_statuses').show();

					feed_type = "random";
					clearTimeout(chronological_status_timeout);
					random_status_timeout = setTimeout(get_and_show_random_status, 1000);

				} else if (selected_feed_type == "feed_chronological") {
					$('#tab-chronological').addClass("active");
					$('#chronological_statuses').show();
					feed_type = "chronological";
					intitialise_chronological();
					clearTimeout(random_status_timeout);
					get_and_show_chronological_status();
				}

			}

			function publish_status(status, wrapper) {
				// delete existing posts with this ID
				$(wrapper + " #" + status.id).remove();

				//are there any responses?
				var response_string = "";
				if (status.responses) {
					if (status.responses.length == 1) {
						response_string = "1 reply";
					} else {
						response_string = String(status.responses.length) + " replies";
					}

					responses_array_string = "'" + status.responses.join("', '") + "'";

					response_string = "<a style=\"cursor:pointer\" onclick=\"show_replies('" + status.id + "', [" + responses_array_string + "])\">" + response_string + "</a>";

				}

				// show new one
				$(wrapper).prepend("<div style=\"display:none\" class=\"panel panel-default status_panel\" id=\"" + status.id + "\"><div class=\"panel-body\"><p>" + status.text + " </p><div class=\"row\"><div class=\"col-md-4\"><small><span style=\"font-weight:bold;\" class=\"votes\">" + status.votes + "</span>  <a style=\"cursor:pointer;\" onclick=\"vote('" + status.id + "')\" >VERB</a> <a style=\"cursor:pointer\" onclick=\"reply('" + status.id + "');\">reply</a></small></div><div class=\"col-md-4\" style=\"text-align:center\"><small>" + response_string + "</small></div><div class=\"col-md-4\"><small><span style=\"float:right;color:#888;\">posted <span class=\"timeago\" title=\"" + status.ISO8601timestamp + "\"></span></span></small></div></div><div class=\"responses\"></div></div>");

				$(wrapper + " div").first().hide().fadeIn();


				$("span.timeago").timeago();

			}

			function vote(id) {
				$("#" + id + " .votes").text(parseInt($("#" + id + " .votes").text()) + 1);
				$("#" + id + " .votes").css("color", "green");

				$.ajax({
					url: '/vote',
					type: 'POST',
					contentType: 'application/json',
					data: JSON.stringify({
						id: id
					})
				}).done(function(data) {
					//something?
				});
			}

			function reply(id) {
				var newText = "@" + id + "\n" + $('#statusText').val();
				$('#statusText').val(newText).focus();
				$('html, body').animate({
					scrollTop: 0
				}, 'fast');
			}

			function set_posted_button() {
				$('#post_status').text("Post Status");
			}

			function show_replies(status_id, replies_ids) {
				for (var i = 0; i < replies_ids.length; i++) {
					// get the status from the ID, append it to the status
					$.get("status/" + replies_ids[i], function(status) {
						publish_status(status, "#" + status_id + " .responses");
					});
				}
			}

			function timeSince(delta) {

				var ps, pm, ph, pd, min, hou, sec, days;

				if (delta <= 59) {
					ps = (delta > 1) ? "s" : "";
					return delta + " second" + ps
				}

				if (delta >= 60 && delta <= 3599) {
					min = Math.floor(delta / 60);
					sec = delta - (min * 60);
					pm = (min > 1) ? "s" : "";
					ps = (sec > 1) ? "s" : "";
					return min + " minute" + pm + " " + sec + " second" + ps;
				}

				if (delta >= 3600 && delta <= 86399) {
					hou = Math.floor(delta / 3600);
					min = Math.floor((delta - (hou * 3600)) / 60);
					ph = (hou > 1) ? "s" : "";
					pm = (min > 1) ? "s" : "";
					return hou + " hour" + ph + " " + min + " minute" + pm;
				}

				if (delta >= 86400) {
					days = Math.floor(delta / 86400);
					hou = Math.floor((delta - (days * 86400)) / 60);
					pd = (days > 1) ? "s" : "";
					ph = (hou > 1) ? "s" : "";
					return delta + " day" + pd + " " + hou + " hour" + ph;
				}

			}