define([
		'jquery', 
		'underscore', 
		'noise-mine', 
		'noise-starred', 
		'noise-hider', 
		'noise-status', 
		'noiys-vote', 
		'noiys-feed'], function(
			$, 
			_, 
			noiysMine, 
			noiysStarred, 
			noiysHider,
			noiysStatus, 
			noiysVote,
			noiysFeed) {

	var feed_type = "random";

	$(document).ready(function() {

		$('body').on('click', '#post_status', function(e) {
			post_status();
		});

		$('body').on('click', '#pause_feed', function(e) {
			noiysFeed.toggle_manual_pause();
		});

		$('body').on('click', '#load_older_statuses', function(e) {
			load_older_chronological_statuses_clicked();
		});

		$('body').on('click', '#search_statuses_button', function(e) {
			run_search();
		});

		$("#search_statuses_text").keyup(function(event) {
			if (event.keyCode == 13) {
				run_search();
			}
		});

		$('body').on('click', '#button-go-up', function(e) {
			$('html, body').animate({
				scrollTop: 0
			}, 'fast');
		});

		$('body').on('click', '#top-nav-tabs > li > a', function(e) {
			change_feed_type($(this).attr('data-feed'));
		});

		$(window).on('scroll', function(){
			if (window.pageYOffset > $('#pause_feed').position().top){
				noiysFeed.set_auto_pause(true);
			} else {
				noiysFeed.set_auto_pause(false);
			}
		});

		$('body').on('click', 'a.button-vote', function(e) {
    		e.stopPropagation();
			noiysVote.post($(this).attr('data-id'));
		});

		$('body').on('click', 'a.button-reply', function(e) {
    		e.stopPropagation();
			reply($(this).attr('data-id'));
		});

		$('body').on('click', 'a.button-remove-my-status', function(e) {
    		e.stopPropagation();
			noiysMine.remove_my_status($(this).attr('data-id'));
		});

		$('body').on('click', 'a.button-star', function(e) {
    		e.stopPropagation();
			noiysStarred.star($(this).attr('data-id'));
			refresh_my_stars();
		});

		$('body').on('click', 'a.button-hide', function(e) {
    		e.stopPropagation();
			noiysHider.hide($(this).attr('data-id'));
		});

		$('body').on('click', 'a.button-unhide', function(e) {
    		e.stopPropagation();
			noiysHider.unhide($(this).attr('data-id'));
		});

		$('body').on('click', 'a.button-show-older-notes', function(e) {
    		e.stopPropagation();
			noiysStatus.show_older_notes($(this), $(this).attr('data-id'));
		});

		$('body').on('click', 'a.button-show-replies', function(e) {
    		e.stopPropagation();
			noiysStatus.show_replies(this, get_currently_visible_wrapper());
		});

		$('body').on('click', 'a.button-search', function(e) {
    		e.stopPropagation();
			goto_search($(this).attr('data-search-term'));
		});

		$('body').on('click', '.list-status', function(e) {
    		e.stopPropagation();
    		noiysStatus.toggle_icon_row(this);
		});

		select_initial_tab();

		noiysStarred.inititalise_my_stars();
		refresh_my_stars();

		noiysMine.inititalise_my_statuses();
		refresh_my_statuses();

		noiysVote.inititalise_vote_updater();

		noiysHider.inititalise_my_hidden();
		noiysHider.hide_all_hidden();

		hide_loding_page();
	});
	
	function hide_loding_page() {
		$('#loading-container').hide();
		$('#main-container').show();
	}

	function post_status() {
		$('#post_status').prop('disabled', true);
		$('#post_status').text("Posting ...");

		noiysStatus.post($('#statusText').val(), function(posted) {

			if (posted) {
				$('#post_status').text("Posted!");
				$('#statusText').val("");

				noiysMine.save_my_status(posted);
				refresh_my_statuses();
				noiysFeed.get_and_show_chronological_status();

			} else if (posted === false) {
				$('#post_status').text("Not Posted ...");
				$('#post_status').addClass("btn-warning");

			}

			$('#post_status').prop('disabled', false);
				setTimeout(set_posted_button, 3000);
		});
	}

	function set_posted_button() {
		$('#post_status').text("Post Note");
		$('#post_status').removeClass("btn-warning");
	}

	function change_feed_type(selected_feed_type) {
		localStorage.current_tab = selected_feed_type;

		$('.nav-tabs li').removeClass("active");
		$('.statuses_wrap').hide();
		$('.nav li .extended').hide();
		
		$('#tab-' + selected_feed_type + " .extended").show();
		$('#tab-' + selected_feed_type).addClass("active");
		$('#' + selected_feed_type + '_statuses').show();

		if ((selected_feed_type == "random") || (selected_feed_type == "chronological")) {
			$('#pause_feed').show();
		} else {
			$('#pause_feed').hide();
		}

		noiysFeed.change(selected_feed_type);
		noiysHider.hide_all_hidden();
	}

	function get_currently_visible_wrapper() {
		return '#' + localStorage.current_tab + '_statuses';
	}


	function select_initial_tab() {
		if (localStorage.current_tab) {
			change_feed_type(localStorage.current_tab)
		} else {
			change_feed_type("home");
		}
	}

	function load_older_chronological_statuses_clicked() {
		$("#load_older_statuses").text("Loading...");
		$('#load_older_statuses').prop('disabled', true);
		noiysFeed.get_and_show_older_chronological_statuses(function() {
			$("#load_older_statuses").text("Load older notes");
			$('#load_older_statuses').prop('disabled', false);
		});
	}

	function run_search() {
		$("#search_statuses_button").text("Searching...");
		$('#search_statuses_button').prop('disabled', true);
		noiysFeed.get_and_show_search_statuses($('#search_statuses_text').val(), function() {
			$("#search_statuses_button").text("Search");
			$('#search_statuses_button').prop('disabled', false);
		});
	}

	function goto_search(search_term) {
		change_feed_type("search");
		$('#search_statuses_text').val(search_term);
		run_search();
	}

	function reply(id) {
		
		$('#statusText').val($('#statusText').val().replace(/@[a-f0-9]{24,24}\n/g, ""));
		$('#statusText').val($('#statusText').val().replace(/@[a-f0-9]{24,24}/g, ""));

		var newText = "@" + id + "\n" + $('#statusText').val();
		$('#statusText').val(newText).focus();
		$('html, body').animate({
			scrollTop: 0
		}, 'fast');
	}

	function refresh_my_stars() {
		
		noiysStarred.get_my_starred_statuses(function(statuses){
			$("#stars_statuses").html("");
			_.each(statuses, function(status) {
				noiysStatus.publish(status, "#stars_statuses", true);
			});

			$('#stars_statuses>div').sort(function(a, b) {
				return $(a).attr("timestamp") < $(b).attr("timestamp") ? 1 : -1;
			}).appendTo("#stars_statuses");
		});
	}

	function refresh_my_statuses() {

		noiysMine.get_my_statuses(function(statuses){
			if (statuses && statuses.length > 0) {

				$("#me_statuses").html("");
				_.each(statuses, function(status) {
					noiysStatus.publish(status, "#me_statuses", true);
				});

				$('#me_statuses>div').sort(function(a, b) {
					return $(a).attr("timestamp") < $(b).attr("timestamp") ? 1 : -1;
				}).appendTo("#me_statuses");
			}
		});
	}

});