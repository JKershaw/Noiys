var paused = false;
var feed_type = "random";
var random_status_timeout, chronological_status_timeout;
var newest_status_timestamp = 0;
var oldest_status_timestamp = Number.MAX_VALUE;
var init_chronological = false;
var my_statuses = Array();
var my_stars = Array();
var current_tab = "random";

$(document).ready(function() {
	random_status_timeout = setTimeout(get_and_show_random_status, 10);
	inititalise_my_stars();
	inititalise_my_statuses();
	select_initial_tab();
});


function change_feed_type(selected_feed_type) {
	$('.nav-tabs li').removeClass("active");
	$('.statuses_wrap').hide();

	clearTimeout(random_status_timeout);
	clearTimeout(chronological_status_timeout);

	feed_type = selected_feed_type;
	localStorage.current_tab = feed_type;

	$('.nav li #extended').hide();
	$('#tab-' + feed_type + " #extended").show();
	$('#tab-' + feed_type).addClass("active");
	$('#' + feed_type + '_statuses').show();
	$('#pause_feed').hide();

	if (feed_type == "random") {
		$('#pause_feed').show();
		random_status_timeout = setTimeout(get_and_show_random_status, 1000);
	} else if (feed_type == "chronological") {
		$('#pause_feed').show();
		intitialise_chronological();
		get_and_show_chronological_status();
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
		$.get("status", function(status) {
			publish_status(status, "#random_statuses", true);
			$("#main_error").hide();
		});
	}

	random_status_timeout = setTimeout(get_and_show_random_status, 6000);

}

function get_and_show_chronological_status() {
	console.debug("get_and_show_chronological_status called");

	if ((paused === false) && (newest_status_timestamp > 0) && (feed_type == 'chronological')) {

		$.ajax({
			url: "status?since=" + newest_status_timestamp,
			type: 'GET',
			contentType: 'application/json',
			complete: function(xhr, textStatus) {
				if (xhr.status == 503) {
					$("#main_error").show();
					_rollbar.push("503 error: " + "status?since=" + newest_status_timestamp);
				} else {
					$("#main_error").hide();
				}
			}
		}).done(function(status) {
			newest_status_timestamp = status.timestamp;
			console.debug("Finished!");
			publish_status(status, "#chronological_statuses", true);

			chronological_status_timeout = setTimeout(get_and_show_chronological_status, 5000);
		}).fail(function() {
			console.debug("No new statuses found");
			chronological_status_timeout = setTimeout(get_and_show_chronological_status, 10000);
		});

	} else {
		chronological_status_timeout = setTimeout(get_and_show_chronological_status, 5000);
	}
}

function get_and_show_search_statuses(search_term, callback) {
	console.debug("get_and_show_search_statuses called");

	$.ajax({
		url: "search/" + encodeURIComponent(search_term),
		type: 'GET',
		contentType: 'application/json',
		complete: function(xhr, textStatus) {
			if (xhr.status == 503) {
				$("#main_error").show();
				_rollbar.push("503 error: " + "status?before=" + oldest_status_timestamp);
			} else {
				$("#main_error").hide();
			}
		}
	}).done(function(statuses) {
		console.debug(statuses);
		$('#search_statuses_result').html('');

		for (var i = 0; i < statuses.length; i++) {
			publish_status(statuses[i], "#search_statuses_result", true);
		}

		$('#search_statuses_result>div').sort(function(a, b) {
			return $(a).attr("timestamp") < $(b).attr("timestamp") ? 1 : -1;
		}).appendTo("#search_statuses_result");

		$('#main_info').hide();
		$("#main_error").hide();

		callback();
	}).fail(function() {
		$('#search_statuses_result').html('No statuses found.');
		callback();
	});

}

function get_and_show_older_chronological_statuses(callback) {
	console.debug("get_and_show_older_chronological_statuses called");

	if ((oldest_status_timestamp < Number.MAX_VALUE) && (feed_type == 'chronological')) {

		$.ajax({
			url: "statuses?before=" + oldest_status_timestamp,
			type: 'GET',
			contentType: 'application/json',
			complete: function(xhr, textStatus) {
				if (xhr.status == 503) {
					$("#main_error").show();
					_rollbar.push("503 error: " + "status?before=" + oldest_status_timestamp);
				} else {
					$("#main_error").hide();
				}
			}
		}).done(function(statuses) {
			console.debug(statuses);
			for (var i = 0; i < statuses.length; i++) {

				if (statuses[i].timestamp < oldest_status_timestamp) {
					oldest_status_timestamp = statuses[i].timestamp;
				}

				publish_status(statuses[i], "#chronological_statuses", false);
			}

			$('#main_info').hide();
			$("#main_error").hide();

			callback();

		}).fail(function() {
			console.debug("No older statuses found");
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
		success: function(savedStatusID) {
			save_my_status(savedStatusID);
		},
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
		get_and_show_chronological_status();

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

$("#load_older_statuses").click(function() {
	$("#load_older_statuses").text("Loading...");
	$('#load_older_statuses').prop('disabled', true);
	get_and_show_older_chronological_statuses(function() {
		$("#load_older_statuses").text("Load older statuses");
		$('#load_older_statuses').prop('disabled', false);
	});
});

$("#search_statuses_button").click(function() {
	run_search();
});

$("#search_statuses_text").keyup(function(event) {
	if (event.keyCode == 13) {
		run_search();
	}
});

function run_search() {
	$("#search_statuses_button").text("Searching...");
	$('#search_statuses_button').prop('disabled', true);
	get_and_show_search_statuses($('#search_statuses_text').val(), function() {
		$("#search_statuses_button").text("Search");
		$('#search_statuses_button').prop('disabled', false);
	});
}

function publish_status(status, wrapper, prepend) {
	// delete existing posts with this ID
	$(wrapper + " #" + status.id).remove();

	if (prepend) {
		$(wrapper).prepend(generate_status_html(status, wrapper));
		$(wrapper + " div").first().hide().fadeIn();
	} else {
		console.debug("appending", status.id);
		$(wrapper + " .final").before(generate_status_html(status, wrapper));
		$(wrapper + " div").show();
	}

	var quote_to_hide_selector = $(wrapper + " #" + status.id + " > div.panel-body > div.panel > div.panel-body > div.panel > div.panel-body > div.panel");

	if (quote_to_hide_selector) {
		quote_to_hide_selector.after("<div class=\"show_quote_link panel panel-default status_panel\"><div class=\"panel-body\"><a style=\"cursor:pointer\" onclick=\"show_hidden_quote('" + status.id + "', '" + wrapper + "')\">Show quote</a></div></div>");
		quote_to_hide_selector.hide();
	}

	$("span.timeago").timeago();

}

function show_hidden_quote(statusID, wrapper) {
	$(wrapper + " #" + statusID + " * .show_quote_link").remove();
	var quote_to_hide_selector = $(wrapper + " #" + statusID + " > div.panel-body > div.panel > div.panel-body > div.panel > div.panel-body > div.panel");
	quote_to_hide_selector.fadeIn();
}

function generate_status_html(status, wrapper) {

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

	var hashtag_regex = /&#35;\w*/g

	status.text = status.text.replace(hashtag_regex, function(match) {
		return "<a style=\"cursor:pointer;\" onclick=\"goto_search('" + match + "')\" >" + match + "</a>";
	});

	var text_string = "<p>" + status.text + " </p>";

	var votes_string = "<span style=\"font-weight:bold;\" class=\"votes\">" + status.votes + "</span>";

	var verb_string = "<a style=\"cursor:pointer;\" onclick=\"vote('" + status.id + "')\" >VERB</a>";

	var reply_string = "<a style=\"cursor:pointer\" onclick=\"reply('" + status.id + "');\"><span class=\"glyphicon glyphicon-retweet\"></a>";

	var trash_string = "";

	if (wrapper == "#me_statuses") {
		trash_string = "<a style=\"cursor:pointer; float:right;\" onclick=\"remove_my_status('" + status.id + "');\"><span class=\"glyphicon glyphicon-remove\"></span></a>";
	}

	if (is_starred(status.id)) {
		var star_string = "<a style=\"cursor:pointer\" onclick=\"star('" + status.id + "');\"><span id=\"star-" + status.id + "\"class=\"glyphicon glyphicon-star\"></a>";
	} else {
		var star_string = "<a style=\"cursor:pointer\" onclick=\"star('" + status.id + "');\"><span id=\"star-" + status.id + "\"class=\"glyphicon glyphicon-star-empty\"></a>";
	}


	var timeago_string = "<small><span style=\"float:right;color:#888;\">posted <span class=\"timeago\" title=\"" + status.ISO8601timestamp + "\"></span></span></small>";


	return "<div style=\"display:none\" class=\"panel panel-default status_panel\" timestamp=\"" + status.timestamp + "\" id=\"" + status.id + "\"><div class=\"panel-body\">" + trash_string + "" + text_string + "<div class=\"row\"><div class=\"col-md-4\"><small>" + votes_string + "&nbsp;&nbsp;&nbsp;" + verb_string + "&nbsp;&nbsp;&nbsp;" + reply_string + "&nbsp;&nbsp;&nbsp;" + star_string + "</small></div><div class=\"col-md-4\" style=\"text-align:center\"><small>" + response_string + "</small></div><div class=\"col-md-4\">" + timeago_string + "</div></div><div class=\"responses\"></div></div>";
}

function goto_search(search_term) {
	change_feed_type("search");
	$('#search_statuses_text').val(search_term);
	run_search();
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
		$.get("status/" + replies_ids[i], function(status) {
			publish_status(status, "#" + status_id + " .responses", true);
		});
	}
}

function save_my_status(statusID) {
	console.debug("saving Status");
	my_statuses.push(statusID);
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
	var tmp_my_statuses = my_statuses;
	for (var i = 0; i < tmp_my_statuses.length; i++) {

		var statusID = tmp_my_statuses[i];

		$.ajax({
			url: "status/" + statusID,
			type: 'GET',
			contentType: 'application/json',
			complete: function(xhr, textStatus) {
				if (xhr.status == 503) {
					$("#main_error").show();
					_rollbar.push("503 error: " + "status" + statusID);
				}
				if (xhr.status == 404) {
					console.debug("Status not found: ", statusID);
					remove_my_status(statusID);
				} else {
					console.log("Err, something");
					$("#main_error").hide();
				}
			}
		}).done(function(status) {
			console.log("Status found");

			publish_status(status, "#me_statuses", true);
			$("#main_error").hide();

			// sort the page
			$('#me_statuses>div').sort(function(a, b) {
				return $(a).attr("timestamp") < $(b).attr("timestamp") ? 1 : -1;
			}).appendTo("#me_statuses");
		});
	}
}

function inititalise_my_statuses() {
	perma_load_my_statuses();
	refresh_my_statuses();
}

function inititalise_my_stars() {
	perma_load_my_stars();
	refresh_my_stars();
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

		var statusID = my_stars[i];

		$.ajax({
			url: "status/" + statusID,
			type: 'GET',
			contentType: 'application/json',
			complete: function(xhr, textStatus) {
				if (xhr.status == 503) {
					$("#main_error").show();
					_rollbar.push("503 error: " + "status" + statusID);
				}
				if (xhr.status == 404) {
					console.debug("Status not found: ", statusID);
					remove_my_star(statusID);
				} else {
					console.log("Err, something");
					$("#main_error").hide();
				}
			}
		}).done(function(status) {
			console.log("Status found");
			publish_status(status, "#stars_statuses", true);
			$("#main_error").hide();

			$('#stars_statuses>div').sort(function(a, b) {
				return $(a).attr("timestamp") < $(b).attr("timestamp") ? 1 : -1;
			}).appendTo("#stars_statuses");
		});
	}
}

function inititalise_my_stars() {
	perma_load_my_stars();
	refresh_my_stars();
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