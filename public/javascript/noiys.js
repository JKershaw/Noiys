var paused = false;
var feed_type = "random";
var random_status_timeout, chronological_status_timeout;
var most_recent_status_timestamp = 0;
var init_chronological = false;
var my_statuses = Array();
var my_stars = Array();

$(document).ready(function() {
	random_status_timeout = setTimeout(get_and_show_random_status, 10);
	inititalise_my_stars();
	inititalise_my_statuses();
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

function change_feed_type(selected_feed_type) {
	$('.nav-tabs li').removeClass("active");
	$('.statuses_wrap').hide();

	clearTimeout(random_status_timeout);
	clearTimeout(chronological_status_timeout);

	feed_type = selected_feed_type;

	if (feed_type == "random") {
		$('#tab-random').addClass("active");
		$('#random_statuses').show();
		random_status_timeout = setTimeout(get_and_show_random_status, 1000);

	} else if (feed_type == "chronological") {
		$('#tab-chronological').addClass("active");
		$('#chronological_statuses').show();
		intitialise_chronological();
		get_and_show_chronological_status();

	} else if (feed_type == "me") {
		$('#tab-me').addClass("active");
		$('#me_statuses').show();

	} else if (feed_type == "stars") {
		$('#tab-stars').addClass("active");
		$('#stars_statuses').show();
	}
}

function publish_status(status, wrapper) {
	// delete existing posts with this ID
	$(wrapper + " #" + status.id).remove();

	// show new one
	$(wrapper).prepend(generate_status_html(status, wrapper));

	$(wrapper + " div").first().hide().fadeIn();

	$("span.timeago").timeago();

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
			publish_status(status, "#" + status_id + " .responses");
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
	console.debug("perma load");
	my_statuses = JSON.parse(localStorage.my_statuses);
	console.debug(my_statuses);
}

function remove_my_status(statusID) {
	console.debug("removeing status", statusID);

	$("#me_statuses #" + statusID).fadeOut("fast", function() {
		$("#me_statuses #" + statusID).remove();
	});

	var index = my_statuses.indexOf(statusID);
	if (index > -1) {
		my_statuses.splice(index, 1);
	}
	perma_save_my_statuses();
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
	console.debug("refresh");
	for (var i = 0; i < my_statuses.length; i++) {

		var statusID = my_statuses[i];

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

			publish_status(status, "#me_statuses");
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
	my_stars = JSON.parse(localStorage.my_stars);
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
			publish_status(status, "#stars_statuses");
			$("#main_error").hide();
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